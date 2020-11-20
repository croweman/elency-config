#!/bin/bash

while [ ! -f ./status/server-up.txt ]; do sleep 1; done

URI=http://app:3000 \
APP_ID=centre \
ENVIRONMENT=Prod \
APP_VERSION=2.0.0 \
HMAC_AUTHORIZATION_KEY=YWJlZjYwNzQwYzk4NDY4Zjg3ZTg5MWU0 \
CONFIG_ENCRYPTION_KEY=M2Y0M2E0NTMyZDBjNDNjNDk5YWJjOGEy \
./elency-config.sh

rc=$?

if [[ $rc != 0 ]]; then
    echo "Something went wrong while trying to retrieve application configuration"
    exit 1
fi

echo "Configuration:"

cat app_configuration.json