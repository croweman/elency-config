FROM node:14.15.1-alpine3.12 as base
WORKDIR /app
COPY controllers ./controllers
COPY domain ./domain
COPY lib ./lib
COPY models ./models
COPY public ./public
COPY views ./views
COPY .npmrc app.js index.js package.json package-lock.json start stop docker-start ./
RUN npm install --production

# production image
FROM base as prod
COPY --from=base /app .

# Create config and sec folders and set permissions
RUN mkdir -p /app/config
RUN mkdir -p /app/sec
RUN chown nobody:nobody /app/config
RUN chown nobody:nobody /app/sec
RUN chown nobody:nobody /app/public/css
RUN chown nobody:nobody /app/public/js
RUN chown nobody:nobody /app/views/includes
RUN chmod 777 /app/views/includes/footer.pug
RUN mkdir /app/configuration_files
RUN chown nobody:nobody /app/configuration_files

USER nobody
EXPOSE 3000

CMD [ "sh", "./docker-start"]