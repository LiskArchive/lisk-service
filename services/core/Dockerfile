FROM node:14 AS builder

RUN apt update
RUN apt install -y build-essential git libtool autoconf automake
RUN useradd -m -s /bin/sh builder

USER builder
RUN mkdir /home/builder/build
WORKDIR /home/builder/build

COPY ./package-lock.json ./package.json ./.npmrc ./
RUN npm ci


FROM node:14

RUN apt update
RUN apt install -y curl
RUN useradd -m -s /bin/sh lisk

COPY ./ /home/lisk/lisk-service/core/
RUN chown -R lisk:lisk /home/lisk/
COPY --from=builder /home/builder/build/node_modules/ /home/lisk/lisk-service/core/node_modules/

USER lisk
WORKDIR /home/lisk/lisk-service/core
CMD ["node", "app.js"]
