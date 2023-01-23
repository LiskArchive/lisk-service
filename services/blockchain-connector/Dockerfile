##### Stage 1

FROM node:16-alpine AS builder

RUN apk add --no-cache alpine-sdk=1.0-r1 python3=3.10.9-r1 cmake=3.24.3-r0 && \
    adduser -D builder

USER builder
WORKDIR /home/builder/build

COPY ./package-lock.json ./package.json ./.npmrc ./
RUN npm ci


##### Stage 2

FROM node:16-alpine

RUN adduser -D lisk && \
    chown -R lisk:lisk /home/lisk/

USER lisk
WORKDIR /home/lisk/lisk-service/blockchain-connector

COPY ./ .
COPY --from=builder /home/builder/build/node_modules/ ./node_modules/

CMD ["node", "app.js"]
