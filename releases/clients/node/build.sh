#!/bin/bash

rm -rf package
mkdir -p package

version=$(jq -r ".version" ../../../clients/node/package.json)

cp -rf ../../../clients/node ./package

cd ./package

mv ./node ./elency-config

rm -rf ./elency-config/node_modules
rm -rf ./elency-config/specs

cd ./elency-config
npm install --production

cd ..
tar -zcvf "elency-config-node-client-$version.tar.gz" elency-config/
rm -rf elency-config
