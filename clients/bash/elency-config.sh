#!/bin/bash

set -e

function validateArguments {
    : ${URI:?"URI has not been defined"}
    : ${APP_ID:?"APP_ID has not been defined"}
    : ${ENVIRONMENT:?"ENVIRONMENT has not been defined"}
    : ${APP_VERSION:?"APP_VERSION has not been defined"}
    : ${HMAC_AUTHORIZATION_KEY:?"HMAC_AUTHORIZATION_KEY has not been defined"}
    : ${CONFIG_ENCRYPTION_KEY:?"CONFIG_ENCRYPTION_KEY has not been defined"}

    if [ ${#HMAC_AUTHORIZATION_KEY} -ne 32 ]; then
        echo "HMAC_AUTHORIZATION_KEY length should be 32"
        exit 1
    fi

    if [ ${#CONFIG_ENCRYPTION_KEY} -ne 32 ]; then
        echo "CONFIG_ENCRYPTION_KEY length should be 32"
        exit 1
    fi
}

function hash {
    valueToHash=$2
    key=$3
    rm -f elency_config_*
    printf "%s" "$valueToHash" >> elency_config_valueToHash
    printf "%s" "$key" >> elency_config_key
    decodedKey=$(base64 --decode -i elency_config_key)
    openssl dgst -sha256 -binary -hmac ${decodedKey} elency_config_valueToHash >> elency_config_hashed
    base64Hash=$(base64 -i elency_config_hashed)
    rm elency_config_*
    eval $1='${base64Hash}'
}

function decrypt {
    encryptedValue=$2
    iv=$3
    key=$4

    ivBytes=$(echo -n "${iv}" | xxd -ps | tr '\n' ' ' | tr '\r' ' ' | tr -d '[:blank:]')
    keyBytes=$(echo -n "${key}" | xxd -ps | tr '\n' ' ' | tr '\r' ' ' | tr -d '[:blank:]')

    cmd="echo -n ${encryptedValue} | xxd -ps -r | openssl enc -d -aes-256-cbc -iv ${ivBytes} -K ${keyBytes}"
    decrypted=$(eval ${cmd})
    eval $1='${decrypted}'
}

function generateAuthorizationHeader() {
    path=$2
    method=$3
    key=$4
    nonce=$(uuidgen)
    timestamp=$(date +%s000)
    value="${APP_ID}${path}${method}${nonce}${timestamp}"
    hash signature ${value} ${key}
    header="${APP_ID}:${signature}:${nonce}:${timestamp}"
    eval $1='${header}'
}

function retrieveAccessToken {
    header=''
    generateAuthorizationHeader header /config head ${HMAC_AUTHORIZATION_KEY}

    rm -f elency_config_*

    url="${URI}/config"
    cmd="curl -s -o elency_config_response --head ${url} -H 'authorization: ${header}' -H 'accept: application/json' -H 'cache-control: no-cache' -H 'content-type: application/json'"
    eval $cmd
    curlResponse=$(cat elency_config_response | grep -Fi x-access-token)

    curlResponse="${curlResponse/x-access-token: /}"
    printf "%s" "${curlResponse}" >> elency_config_output
    curlOutput=$(tr -d '\n' < elency_config_output)
    printf "%s" "${curlOutput}" >> elency_config_output2
    curlOutput=$(tr -d '\r' < elency_config_output2)

    rm -f elency_config_*
    eval $1='${curlOutput}'
}

function getAuthorizationHeader() {
    header=''
    generateAuthorizationHeader header ${lowerConfigurationPath} get ${CONFIG_ENCRYPTION_KEY}
    eval $1='${header}'
}

function getConfiguration() {
    configurationPath=$1
    authorizationHeader=$2
    accessToken=$3

    url="${URI}${configurationPath}"
    cmd="curl -s -o elency_config_response -X GET ${url} -H 'accept: application/json' -H 'cache-control: no-cache' -H 'content-type: application/json' -H 'authorization: ${authorizationHeader}' -H 'x-access-token: ${accessToken}'"
    eval $cmd

    response=$(cat elency_config_response)

    configuration='{'
    configurationId=$(echo ${response} | jq -r .configurationId)
    configurationHash=$(echo ${response} | jq -r .configurationHash)
    appVersion=$(echo ${response} | jq -r .appVersion)
    environment=$(echo ${response} | jq -r .environment)
    configuration="$configuration \"configurationId\": \"$configurationId\","
    configuration="$configuration \"configurationHash\": \"$configurationHash\","
    configuration="$configuration \"appVersion\": \"$appVersion\","
    configuration="$configuration \"environment\": \"$environment\","
    configuration="$configuration \"entries\":["

    encryptedConfiguration=$(echo ${response} | jq -r .configuration)

    content=$(echo ${encryptedConfiguration} | jq -r .[0])
    iv=$(echo ${encryptedConfiguration} | jq -r .[1])

    decrypted=''
    decrypt decrypted $content $iv $CONFIG_ENCRYPTION_KEY
    #echo ${decrypted}

    rm -f app_configuration.json

    for keyItem in $(echo "${decrypted}" | jq -r '.[] | @base64'); do
        function _jq() {
         echo ${keyItem} | base64 --decode | jq -r ${1}
        }

       keyName=$(_jq '.key')
       value=''
       encrypted=$(_jq '.encrypted')

       if [ ${encrypted} == "true" ]; then
           decryptedItemValue=''
           itemEncrypted=$(_jq '.value[0]')
           itemIv=$(_jq '.value[1]')
           decrypt decryptedItemValue $itemEncrypted $itemIv $CONFIG_ENCRYPTION_KEY
           value=$decryptedItemValue
       else
         value=$(_jq '.value[0]')
       fi

       value=${value//\"/\\\"}
       value=$(echo "$value" | tr -d '\t' | tr -d '\r' | tr -d '\n')

       configuration="$configuration { \"$keyName\": \"$value\" },"
    done

    configuration="$configuration]}"
    configuration=${configuration//\,\]\}/\]\}}

    cmd="jq -n '${configuration}' >> app_configuration.json"
    eval $cmd
    rm -f elency_config_response
}

validateArguments

echo "Retrieving configuration"
echo "Application: ${APP_ID}"
echo "Environment: ${ENVIRONMENT}"
echo "Version: ${APP_VERSION}"

configurationPath="/config/${APP_ID}/${ENVIRONMENT}/${APP_VERSION}"
lowerConfigurationPath=$(echo "$configurationPath" | tr '[:upper:]' '[:lower:]')

accessToken=''
retrieveAccessToken accessToken

authorizationHeader=''
getAuthorizationHeader authorizationHeader

getConfiguration ${configurationPath} ${authorizationHeader} ${accessToken}

echo "Configuration has been wrote to ./app_configuration.json"

rm -f elency_config_*