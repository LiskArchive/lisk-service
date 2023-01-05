FROM node:16-alpine AS builder

RUN apk add --no-cache alpine-sdk python3 git libtool autoconf automake
RUN adduser -D builder

USER builder
RUN mkdir /home/builder/build
WORKDIR /home/builder/build

COPY ./package-lock.json ./package.json .babelrc ./
RUN npm ci


FROM node:16-alpine

RUN apk add --no-cache curl
RUN adduser -D lisk

COPY ./ /home/lisk/lisk-service/tests/
COPY --from=builder /home/builder/build/node_modules/ /home/lisk/lisk-service/tests/node_modules/

USER lisk
WORKDIR /home/lisk/lisk-service/tests
CMD ["node", "app.js"]
