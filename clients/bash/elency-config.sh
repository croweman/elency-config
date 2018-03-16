#!/bin/bash

set -e

#########################
# DEPENDENCY ON openssl #
#########################

# options, export environment, produce json file, log out json output

#URI=http://localhost:3000 APP_ID=awesome-micro-service ENVIRONMENT=production APP_VERSION=2.0.0 HMAC_AUTHORIZATION_KEY=YWJlZjYwNzQwYzk4NDY4Zjg3ZTg5MWU0 CONFIG_ENCRYPTION_KEY=M2VlMzRiOTFiNmM0NDY2YWI0MTAxZmZi ./elency-config.sh

function validateArguments {
    : ${URI:?"URI has not been defined"}
    : ${APP_ID:?"APP_ID has not been defined"}
    : ${ENVIRONMENT:?"ENVIRONMENT has not been defined"}
    : ${APP_VERSION:?"APP_VERSION has not been defined"}
    : ${HMAC_AUTHORIZATION_KEY:?"HMAC_AUTHORIZATION_KEY has not been defined"}
    : ${CONFIG_ENCRYPTION_KEY:?"CONFIG_ENCRYPTION_KEY has not been defined"}

    if [ ${#HMAC_AUTHORIZATION_KEY} -ne 32 ]; then
        echo "HMAC_AUTHORIZATION_KEY length should be 32"
        exit
    fi

    if [ ${#CONFIG_ENCRYPTION_KEY} -ne 32 ]; then
        echo "CONFIG_ENCRYPTION_KEY length should be 32"
        exit
    fi
}

function hash {
    valueToHash=$2
    key=$3
    rm -f tmp_*
    printf "%s" "$valueToHash" >> tmp_valueToHash
    printf "%s" "$key" >> tmp_key
    decodedKey=$(base64 --decode -i tmp_key)
    openssl dgst -sha256 -binary -hmac ${decodedKey} tmp_valueToHash >> tmp_hashed
    base64Hash=$(base64 -i tmp_hashed)
    rm tmp_*
    eval $1=${base64Hash}
}

function generateAuthorizationHeader() {
    path=$2
    method=$3
    key=$4
    nonce=$(uuidgen)
    timestamp=$(date +%s000)
    value="${APP_ID}${path}${method}${nonce}${timestamp}"
    signature=''
    hash signature ${value} ${key}

    header="${APP_ID}:${signature}:${nonce}:${timestamp}"
    eval $1=${header}
}

function retrieveAccessToken {
    header=''
    generateAuthorizationHeader header /config head ${HMAC_AUTHORIZATION_KEY}

    echo ${header}

    rm -f curl_*

    url="${URI}/config"
    cmd="curl -i -D curl_response --head ${url} -H 'authorization: ${header}' -H 'accept: application/json' -H 'cache-control: no-cache' -H 'content-type: application/json'"
    #echo ${cmd}

    eval $cmd
    curlResponse=$(cat curl_response | grep -Fi x-access-token)
    echo ${curlResponse}

    #THERE IS A FUCKING CARRIAGE RETURN IN ACCESS TOKEN
    curlResponse="${curlResponse/x-access-token: /}"
    echo ${curlResponse}
    printf "%s" "${curlResponse}" >> curl_output
    curlOutput=$(tr -d '\n' < curl_output)
    printf "%s" "${curlOutput}" >> curl_output2
    curlOutput=$(tr -d '\r' < curl_output2)
    printf "%s" "${curlOutput}" >> curl_output3

    rm -f curl_*

    eval $1='${curlOutput}'
}

function getAuthorizationHeader() {
    header=''
    generateAuthorizationHeader header ${lowerConfigurationPath} get ${CONFIG_ENCRYPTION_KEY}
    eval $1='${header}'
}

function getConfiguration() {
    configurationPath=$1
    echo ${configurationPath}
    printf "%s" "$configurationPath" >> tmp_configurationPath
    authorizationHeader=$2
    echo ${authorizationHeader}
    printf "%s" "$authorizationHeader" >> tmp_authorizationHeader
    accessToken=$3
    echo ${accessToken}
    printf "%s" "$accessToken" >> tmp_accessToken

    url="${URI}${configurationPath}"
    #-H 'authorization: ${authorizationHeader}'
    # -H 'x-access-token: ${accessToken}'
    cmd="curl -i -D curl_response -X GET ${url} -H 'accept: application/json' -H 'cache-control: no-cache' -H 'content-type: application/json' -H 'authorization: ${authorizationHeader}' -H 'x-access-token: ${accessToken}'"
    echo ${cmd}

    eval $cmd

    rm -f curl_response
}

validateArguments

configurationPath="/config/${APP_ID}/${ENVIRONMENT}/${APP_VERSION}"
lowerConfigurationPath=$(echo "$configurationPath" | tr '[:upper:]' '[:lower:]')

accessToken=''
retrieveAccessToken accessToken
echo ${accessToken}

authorizationHeader=''
getAuthorizationHeader authorizationHeader
echo ${authorizationHeader}

getConfiguration ${configurationPath} ${authorizationHeader} ${accessToken}


rm -f tmp_*
rm -f curl_*

