#!/bin/sh
./bin/run blockchain:import /tmp/snapshots/blockchain.tar.gz --force

./bin/run start --network=devnet --api-ws --api-host=0.0.0.0 --api-port=7887
