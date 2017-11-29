#!/bin/bash

rm -rf package
mkdir -p package

version=$(jq -r ".version" ../../server/package.json)

cp -rf ../../server ./package

cd ./package

mv ./server ./elency-config-server

rm -rf ./elency-config-server/node_modules
rm ./elency-config-server/config/*.*
rm ./elency-config-server/sec/*.*
rm -rf ./elency-config-server/specs
rm ./elency-config-server/public/css/elency-config_*
rm ./elency-config-server/public/js/elency-config_*
rm ./elency-config-server/todo.txt
rm -rf ./elency-config-server/configuration_files
rm -rf ./elency-config-server/configuration_files_from_secure_location

cd ./elency-config-server
npm install --production

cd ..
tar -zcvf "elency-config-server-$version.tar.gz" elency-config-server/
rm -rf elency-config-server
