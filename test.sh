#!/bin/bash

RED='\033[0;31m'

function checkError() {
  if [ $? -eq "1" ]; then
    echo " ";
    echo -e "${RED} Tests exited with a process code of 1";
    exit 1;
  fi
}

killall node

cd ./clients/node
npm install
npm test

checkError $?

cd ../../server
npm install
npm test

checkError $?

cd ./server
npm run startlocal & nodeprocessid=$!

cd ..

CREATE_CONFIG_DATA=true npm run consumertests

kill $nodeprocessid

checkError $?