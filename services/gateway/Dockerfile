##### Stage 1

FROM node:16-alpine AS builder

RUN adduser -D builder

USER builder
WORKDIR /home/builder/build

COPY ./package-lock.json ./package.json ./
RUN npm ci && \
    # generate build timestamp as described in https://github.com/LiskHQ/lisk-service/issues/385
    node -e 'console.log(JSON.stringify({ timestamp: new Date().toISOString() }));' > ./build.json


##### Stage 2

FROM node:16-alpine

RUN apk add --no-cache curl && \
    adduser -D lisk

USER lisk
WORKDIR /home/lisk/lisk-service/gateway

COPY ./ .
COPY --from=builder /home/builder/build/ .

EXPOSE 9901
HEALTHCHECK CMD curl --fail http://localhost:9901/api/status || exit 1

CMD ["node", "app.js"]
