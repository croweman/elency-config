FROM node:carbon-alpine as base
WORKDIR /app

COPY ./lib ./lib
COPY ./index.js ./package.json ./package-lock.json ./

RUN npm install --production

CMD [ "node", "./index.js"]