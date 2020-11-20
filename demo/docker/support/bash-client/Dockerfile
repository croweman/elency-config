FROM node:14.15.1-alpine3.12 as base
WORKDIR /app

COPY ./ ./

RUN apk add --no-cache bash

RUN apk add --no-cache util-linux

RUN apk add --no-cache coreutils

RUN apk add --no-cache openssl

RUN apk add --no-cache curl

RUN apk add --no-cache jq

RUN apk add --no-cache xxd

CMD [ "/bin/bash", "./run.sh"]