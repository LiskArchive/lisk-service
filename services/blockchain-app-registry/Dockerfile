FROM node:16-alpine AS builder

RUN apk add --no-cache alpine-sdk=1.0-r1 python3=3.10.9-r1 git=2.38.3-r1
RUN adduser -D builder

USER builder
RUN mkdir /home/builder/build
WORKDIR /home/builder/build

COPY ./package-lock.json ./package.json ./
RUN npm ci


FROM node:16-alpine

RUN apk add --no-cache curl
RUN adduser -D lisk

COPY ./ /home/lisk/lisk-service/blockchain-app-registry/
COPY --from=builder /home/builder/build/node_modules/ /home/lisk/lisk-service/blockchain-app-registry/node_modules/

USER lisk
WORKDIR /home/lisk/lisk-service/blockchain-app-registry
CMD ["node", "app.js"]
