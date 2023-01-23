##### Stage 1

FROM node:16-alpine AS builder

RUN adduser -D builder

USER builder
WORKDIR /home/builder/build

COPY ./package-lock.json ./package.json ./
RUN npm ci


##### Stage 2

FROM node:16-alpine

RUN adduser -D lisk && \
    chown -R lisk:lisk /home/lisk/

USER lisk
WORKDIR /home/lisk/lisk-service/market

COPY ./ .
COPY --from=builder /home/builder/build/node_modules/ ./node_modules/

CMD ["node", "app.js"]
