#!/bin/sh

/home/lisk/node_modules/.bin/lisk-core blockchain:import /tmp/snapshots/blockchain.db.tar.gz --force
/home/lisk/node_modules/.bin/lisk-core forger-info:import /tmp/snapshots/forger.db.tar.gz --force

/home/lisk/node_modules/.bin/lisk-core start --network=devnet --api-ws --api-ws-port=5001 --enable-forger-plugin --enable-http-api-plugin --http-api-plugin-port=4000 --http-api-plugin-whitelist=172.16.0.0/12
