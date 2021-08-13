#!/bin/sh
mkdir -p ~/lisk/config/devnet
cp /tmp/config/genesis_block.json ~/lisk/config/devnet/

/home/lisk/node_modules/.bin/lisk-core start --network=devnet --api-ws --api-ws-port=5001 --enable-forger-plugin --enable-http-api-plugin --http-api-plugin-port=4000 --http-api-plugin-whitelist=172.16.0.0/12 -d ~/lisk