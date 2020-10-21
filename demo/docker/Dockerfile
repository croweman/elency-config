FROM node:12.18.3-alpine3.12 as base
WORKDIR /app
COPY support/configuration_files ./support
COPY support/client ./
COPY support/lib ./lib
COPY support/models ./models
COPY support/demo-setup support/data.js support/insert-data.js support/wait.js ./

RUN npm install --production

CMD [ "/bin/sh", "./demo-setup"]