FROM node:14-alpine AS builder

RUN apk add --no-cache git
RUN adduser -D builder

USER builder
RUN mkdir /home/builder/build
WORKDIR /home/builder/build

COPY ./package-lock.json ./package.json ./
RUN npm ci

# generate build timestamp as described in https://github.com/LiskHQ/lisk-service/issues/385
RUN node -e 'console.log(JSON.stringify({ timestamp: new Date().toISOString() }));' > ./build.json


FROM node:14-alpine

RUN apk add --no-cache curl
RUN adduser -D lisk

COPY ./ /home/lisk/lisk-service/gateway/
COPY --from=builder /home/builder/build/node_modules/ /home/lisk/lisk-service/gateway/node_modules/
COPY --from=builder /home/builder/build/build.json /home/lisk/lisk-service/gateway/

USER lisk
WORKDIR /home/lisk/lisk-service/gateway
CMD ["node", "app.js"]
EXPOSE 9901
HEALTHCHECK CMD curl --fail http://localhost:9901/api/status
