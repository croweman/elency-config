FROM node:12.18.3-alpine3.12 as base

WORKDIR /app

COPY lib ./lib
COPY index.js package.json package-lock.json  ./
RUN npm install --production

EXPOSE 3001

CMD [ "node", "./index.js"]