FROM node:current-alpine

LABEL org.opencontainers.image.title="Rule-validation API" \
      org.opencontainers.image.description="Web API that allows querying of two API endpoints" \
      org.opencontainers.image.authors="@mosesbenjamin"

RUN mkdir -p /usr/src/app

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN npm install

ENTRYPOINT ["node", "app.js"]