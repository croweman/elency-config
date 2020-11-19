FROM node:14.15.1-alpine3.12 as base
WORKDIR /app
COPY support/configuration_files ./support
COPY support/certs ./support
COPY support/lib ./lib
COPY support/models ./models
COPY support/demo-setup support/data.js support/insert-data.js support/wait.js support/package.json support/package-lock.json ./

RUN npm install --production

CMD [ "/bin/sh", "./demo-setup"]