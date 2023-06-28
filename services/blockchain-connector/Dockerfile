##### Stage 1

FROM node:16-alpine AS builder

RUN apk add --no-cache alpine-sdk=~1 python3=~3 cmake=~3 && \
    adduser -D builder && \
    mkdir /home/builder/build && \
    chown -R builder:builder /home/builder/

USER builder
WORKDIR /home/builder/build

COPY ./package-lock.json ./package.json ./.npmrc ./
RUN npm ci


##### Stage 2

FROM node:16-alpine

RUN mkdir -p /home/lisk/lisk-service/blockchain-connector/data && \
    adduser -D lisk && \
    chown -R lisk:lisk /home/lisk/

USER lisk
WORKDIR /home/lisk/lisk-service/blockchain-connector

COPY ./ .
COPY --from=builder /home/builder/build/node_modules/ ./node_modules/

CMD ["node", "app.js"]
