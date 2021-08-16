#!/bin/sh
mkdir -p ~/.lisk/lisk-core/config/devnet/
cp /tmp/config/genesis_block.json ~/.lisk/lisk-core/config/devnet/

/home/lisk/node_modules/.bin/lisk-core blockchain:import /tmp/snapshots/blockchain.db.tar.gz --force
/home/lisk/node_modules/.bin/lisk-core forger-info:import /tmp/snapshots/forger.db.tar.gz --force

/home/lisk/node_modules/.bin/lisk-core start --network=devnet --api-ws --api-ws-host=0.0.0.0 --api-ws-port=5001 --enable-forger-plugin