FROM node:14-alpine AS builder

RUN apk add --no-cache alpine-sdk python2 git
RUN adduser -D builder

USER builder
RUN mkdir /home/builder/build
WORKDIR /home/builder/build

COPY ./package-lock.json ./package.json ./
RUN npm ci


FROM node:14-alpine

RUN apk add --no-cache curl
RUN adduser -D lisk

COPY ./ /home/lisk/lisk-service/template/
COPY --from=builder /home/builder/build/node_modules/ /home/lisk/lisk-service/template/node_modules/

USER lisk
WORKDIR /home/lisk/lisk-service/template
CMD ["node", "app.js"]
