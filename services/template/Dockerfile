##### Stage 1

FROM node:18-alpine AS builder

RUN adduser -D builder && \
    mkdir /home/builder/build && \
    chown -R builder:builder /home/builder/

USER builder
WORKDIR /home/builder/build

COPY ./yarn.lock ./package.json ./
RUN yarn install --frozen-lockfile


##### Stage 2

FROM node:18-alpine

RUN adduser -D lisk && \
    chown -R lisk:lisk /home/lisk/

USER lisk
WORKDIR /home/lisk/lisk-service/template

COPY --chown=lisk:lisk ./ .
COPY --chown=lisk:lisk --from=builder /home/builder/build/node_modules/ ./node_modules/

CMD ["node", "app.js"]
