ARG NODEJS_VERSION=18

##### Stage 1

FROM node:$NODEJS_VERSION-alpine AS builder

RUN adduser -D builder && \
    mkdir /home/builder/build && \
    chown -R builder:builder /home/builder/

USER builder
WORKDIR /home/builder/build

COPY ./yarn.lock ./package.json ./
RUN yarn install --frozen-lockfile


##### Stage 2

FROM node:$NODEJS_VERSION-alpine

RUN mkdir -p /home/lisk/lisk-service/blockchain-app-registry/data && \
    adduser -D lisk && \
    chown -R lisk:lisk /home/lisk/

USER lisk
WORKDIR /home/lisk/lisk-service/blockchain-app-registry

COPY --chown=lisk:lisk ./ .
COPY --chown=lisk:lisk --from=builder /home/builder/build/node_modules/ ./node_modules/

CMD ["node", "app.js"]
