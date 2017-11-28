#!/bin/bash

rm -rf package
mkdir -p package

version=$(jq -r ".version" ../../server/package.json)

cp -rf ../../server ./package

cd ./package

mv ./server ./elency-config-server

rm -rf ./elency-config-server/node_modules
rm ./elency-config-server/config/.gitkeep
rm ./elency-config-server/config/config.json
rm ./elency-config-server/config/keys.json
rm ./elency-config-server/sec/.gitkeep
rm ./elency-config-server/sec/*.*
rm -rf ./elency-config-server/specs
rm ./elency-config-server/todo.txt

cd ./elency-config-server
npm install --production

cd ..
tar -zcvf "elency-config-server-$version.tar.gz" elency-config-server/
rm -rf elency-config-server
