FROM node:16-alpine AS builder

RUN apk add --no-cache alpine-sdk=1.0-r1 python3=3.10.9-r1 git=2.38.3-r1 libtool=2.4.7-r0 autoconf=2.71-r1 automake=1.16.5-r1 cmake=3.24.3-r0
RUN adduser -D builder

USER builder
RUN mkdir /home/builder/build
WORKDIR /home/builder/build

COPY ./package-lock.json ./package.json ./.npmrc ./
RUN npm ci


FROM node:16-alpine

RUN apk add --no-cache curl
RUN adduser -D lisk

COPY ./ /home/lisk/lisk-service/fee-estimator/
RUN chown -R lisk:lisk /home/lisk/
COPY --from=builder /home/builder/build/node_modules/ /home/lisk/lisk-service/fee-estimator/node_modules/

USER lisk
WORKDIR /home/lisk/lisk-service/fee-estimator
CMD ["node", "app.js"]
