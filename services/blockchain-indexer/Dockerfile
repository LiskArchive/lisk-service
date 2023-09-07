##### Stage 1

FROM node:18-alpine AS builder

RUN adduser -D builder && \
    mkdir /home/builder/build && \
    chown -R builder:builder /home/builder/

USER builder
WORKDIR /home/builder/build

COPY ./yarn.lock ./package.json ./.npmrc ./
RUN yarn install --frozen-lockfile


##### Stage 2

FROM node:18-alpine

RUN apk update && apk add --no-cache mysql-client=~10 && \
    mkdir -p /home/lisk/lisk-service/blockchain-indexer/data && \
    adduser -D lisk && \
    chown -R lisk:lisk /home/lisk/

USER lisk
WORKDIR /home/lisk/lisk-service/blockchain-indexer

COPY --chown=lisk:lisk ./ .
COPY --chown=lisk:lisk --from=builder /home/builder/build/node_modules/ ./node_modules/

CMD ["node", "app.js"]
