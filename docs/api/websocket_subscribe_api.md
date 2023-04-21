# Lisk Service Subscribe API Documentation

The Lisk Service is a web application that interacts with the entire Lisk ecosystem in various aspects. For example, one key aspect is an update about blockchain events.

The Subscribe API is sometimes called publish/subscribe or Event-Driven API. The biggest difference between Event-Driven and regular REST API is not only technical. In practice, a two-way streaming connection is used, which means that not only can the client request the server for a data update, (and also potential updates) but also the server can notify the client about new data instantly as it arrives.

Lisk Service leverages the two-way communication approach by utilizing the WebSocket library responsible for updating users about changes in the blockchain network and markets.

## Table of Contents

- [Lisk Service Subscribe API Documentation](#lisk-service-subscribe-api-documentation)
  - [Access paths and compatibility](#access-paths-and-compatibility)
  - [Endpoint Logic](#endpoint-logic)
  - [Payloads](#payloads)
  - [Example of a client implementation](#example-of-a-client-implementation)
    - [Node.js](#nodejs)
- [Blockchain updates (`/blockchain`)](#blockchain-updates-blockchain)
  - [`new.block`](#newblock)
    - [Payload](#payload)
  - [`delete.block`](#deleteblock)
    - [Payload](#payload-1)
  - [`new.transactions`](#newtransactions)
    - [Payload](#payload-2)
  - [`delete.transactions`](#deletetransactions)
    - [Payload](#payload-3)
  - [`update.round`](#updateround)
    - [Payload](#payload-4)
  - [`update.generators`](#updategenerators)
    - [Payload](#payload-5)
  - [`update.fee_estimates`](#updatefee_estimates)
    - [Payload](#payload-6)
  - [`update.metadata`](#updatemetadata)
    - [Payload](#payload-7)

## Access paths and compatibility

The blockchain update API can be accessed by the following path `https://service.lisk.com/blockchain`.

You might also be interested in accessing the `testnet` network by using the `https://testnet-service.lisk.com/blockchain` endpoint.

**Important:** The Lisk Service WebSocket API uses the `socket.io` library. This implementation is compatible with version 2.0 of the `socket.io` library. Using the wrong major version might result in a broken connection and events not being passed.

The specification below contains numerous examples of how to use the API in practice.

## Endpoint Logic

The logic of the endpoints comes as follows: the method naming is always based on the following pattern: `<action>.<entity>`, where the `action` is equivalent to the method type performed on the server (ie. update) and `entity` is a part of the application logic, eg. `blocks`, `transactions`.

## Payloads

All the event payloads are returned in the JSON format - application/json and adhere to the following structure:

```jsonc
{
    "data": {}, // Contains the update information
    "meta": {
        "count": <integer>, // number of items
        "timestamp": <timestamp>, // timestamp in seconds
        ...               // other metadata
    },
}
```

## Example of a client implementation

### Node.js

```javascript
const io = require('socket.io-client');
const connection = io.connect('https://service.lisk.com/blockchain', { transports: ['websocket'] });
connection.on('update.block', (block) => { (...) });
```

# Blockchain updates (`/blockchain`)

## `new.block`

Updates about a newly generated block.

### Payload

```jsonc
{
  "data": [
    {
      "id": "01967dba384998026fe028119bd099ecf073c05c045381500a93d1a7c7307e5b",
      "version": 0,
      "height": 8344448,
      "timestamp": 85944650,
      "previousBlockId": "827080df7829cd2757501a85f80a0767fcb40615304b701c2890dbbaf214bb89",
      "generator": {
        "address": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
        "name": "genesis_3",
        "publicKey": "32ddb97e8d7e607a14fef8449c2a2180cd74a51f67b04a50a4b1917d3ca8a52e"
      },
      "transactionRoot": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "assetsRoot": "6e904b2f678eb3b6c3042acb188a607d903d441d61508d047fe36b3c982995c8",
      "stateRoot": "95d9b1773b78034b8df9ac741c903b881da761d8ba002a939de28a4b86982c04",
      "maxHeightGenerated": 559421,
      "maxHeightPrevoted": 559434,
      "validatorsHash": "ad0076aa444f6cda608bb163c3bd77d9bf172f1d2803d53095bc0f277db6bcb3",
      "aggregateCommit": {
        "height": 166,
        "aggregationBits": "ffffffffffffffffffffffff1f",
        "certificateSignature": "a7db952f87db29718c40afca9a9fb2f6b605f8588c1c99e41e92f26ec005e6d14327c33051fa383fe903b7040d16c7441570167a73d9468aa16a6720c765b3f22aeca42102c45b4616fd7543d7a0649e0fa934e0de1973486eede9d56f014f9f"
      },
      "numberOfTransactions": 10,
      "numberOfAssets": 10,
      "numberOfEvents": 10,
      "totalBurnt": "0",
      "networkFee": "15000000",
      "totalForged": "65000000",
      "reward": "50000000",
      "signature": "a3733254aad600fa787d6223002278c3400be5e8ed4763ae27f9a15b80e20c22ac9259dc926f4f4cabdf0e4f8cec49308fa8296d71c288f56b9d1e11dfe81e07",
      "isFinal": true
    }
  ],
  "meta": {
    "count": 1,
    "offset": 0,
    "total": 1
  }
}
```

## `delete.block`

Updates about a deleted block. This usually happens when the chain switches forks.

### Payload

```jsonc
{
  "data": [
    {
      "id": "01967dba384998026fe028119bd099ecf073c05c045381500a93d1a7c7307e5b",
      "version": 0,
      "height": 8344448,
      "timestamp": 85944650,
      "previousBlockId": "827080df7829cd2757501a85f80a0767fcb40615304b701c2890dbbaf214bb89",
      "generator": {
        "address": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
        "name": "genesis_3",
        "publicKey": "32ddb97e8d7e607a14fef8449c2a2180cd74a51f67b04a50a4b1917d3ca8a52e"
      },
      "transactionRoot": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "assetsRoot": "6e904b2f678eb3b6c3042acb188a607d903d441d61508d047fe36b3c982995c8",
      "stateRoot": "95d9b1773b78034b8df9ac741c903b881da761d8ba002a939de28a4b86982c04",
      "maxHeightGenerated": 559421,
      "maxHeightPrevoted": 559434,
      "validatorsHash": "ad0076aa444f6cda608bb163c3bd77d9bf172f1d2803d53095bc0f277db6bcb3",
      "aggregateCommit": {
        "height": 166,
        "aggregationBits": "ffffffffffffffffffffffff1f",
        "certificateSignature": "a7db952f87db29718c40afca9a9fb2f6b605f8588c1c99e41e92f26ec005e6d14327c33051fa383fe903b7040d16c7441570167a73d9468aa16a6720c765b3f22aeca42102c45b4616fd7543d7a0649e0fa934e0de1973486eede9d56f014f9f"
      },
      "numberOfTransactions": 10,
      "numberOfAssets": 10,
      "numberOfEvents": 10,
      "totalBurnt": "0",
      "networkFee": "15000000",
      "totalForged": "65000000",
      "reward": "50000000",
      "signature": "a3733254aad600fa787d6223002278c3400be5e8ed4763ae27f9a15b80e20c22ac9259dc926f4f4cabdf0e4f8cec49308fa8296d71c288f56b9d1e11dfe81e07",
      "isFinal": true
    }
  ],
  "meta": {
    "count": 1,
    "offset": 0,
    "total": 1
  }
}
```

## `new.transactions`

Updates about included transactions within a newly generated block.

### Payload

```jsonc
{
  "data": [
    {
      "id": "65c28137c130c6609a67fccfcd9d0f7c3df3577324f8d33134326d653ded613f",
      "moduleCommand": "token:transfer",
      "nonce": "1",
      "fee": "5166000",
      "minFee": "165000",
      "size": 166,
      "sender": {
        "address": "lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo",
        "publicKey": "475697e34ae02b394721020d38677a072dbd5c03d61c1c8fdd6563eb66160fa3",
        "name": "genesis_0"
      },
      "params": {
        "tokenID": "0400000100000000",
        "amount": "10000000000",
        "recipientAddress": "lskezo8pcrbsoceuuu64rpc8w2qkont2ec3n772yu",
        "data": ""
      },
      "block": {
        "id": "ebb1ba587a1e8385a2aac1317edcb872c05b2b07df6560fabd0f0d23d7d6a0df",
        "height": 122721,
        "timestamp": 1678989430,
        "isFinal": true
      },
      "meta": {
        "recipient": {
          "address": "lskezo8pcrbsoceuuu64rpc8w2qkont2ec3n772yu",
          "publicKey": null,
          "name": null
        }
      },
      "executionStatus": "success",
      "index": 0
    },
  ],
  "meta": {
    "count": 1,
    "offset": 0,
    "total": 1
  }
}
```

## `delete.transactions`

Updates about deleted transactions within a deleted block. This usually happens when the chain switches forks.

### Payload

```jsonc
{
  "data": [
    {
      "id": "65c28137c130c6609a67fccfcd9d0f7c3df3577324f8d33134326d653ded613f",
      "moduleCommand": "token:transfer",
      "nonce": "1",
      "fee": "5166000",
      "minFee": "165000",
      "size": 166,
      "sender": {
        "address": "lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo",
        "publicKey": "475697e34ae02b394721020d38677a072dbd5c03d61c1c8fdd6563eb66160fa3",
        "name": "genesis_0"
      },
      "params": {
        "tokenID": "0400000100000000",
        "amount": "10000000000",
        "recipientAddress": "lskezo8pcrbsoceuuu64rpc8w2qkont2ec3n772yu",
        "data": ""
      },
      "block": {
        "id": "ebb1ba587a1e8385a2aac1317edcb872c05b2b07df6560fabd0f0d23d7d6a0df",
        "height": 122721,
        "timestamp": 1678989430,
        "isFinal": true
      },
      "meta": {
        "recipient": {
          "address": "lskezo8pcrbsoceuuu64rpc8w2qkont2ec3n772yu",
          "publicKey": null,
          "name": null
        }
      },
      "executionStatus": "success",
      "index": 0
    },
  ],
  "meta": {
    "count": 1,
    "offset": 0,
    "total": 1
  }
}
```

## `update.round`

Updates about the generators for the next round.

### Payload

```jsonc
{
  "data": [
    {
      "address": "lskjta9erat6qqpa32hqbssttc6p5da3k7tydvhmv",
      "name": "panzer",
      "publicKey": "2ca9a7...c23079",
      "nextAllocatedTime": 1659863166
    },
    ...
  ],
  "meta": {
    "count": 10,
    "offset": 0,
    "total": 103,
  },
}
```

## `update.generators`

Updates the current generators list, so the current generator is in the first position.

### Payload

```jsonc
{
  "data": [
    {
      "address": "lskjta9erat6qqpa32hqbssttc6p5da3k7tydvhmv",
      "name": "panzer",
      "publicKey": "2ca9a7...c23079",
      "nextAllocatedTime": 1659863166
    },
    ...
  ],
  "meta": {
    "count": 10,
    "offset": 0,
    "total": 103,
  },
}
```

## `update.fee_estimates`

Updates about recent fee estimates.

### Payload

```jsonc
{
  "data": {
    "feeEstimatePerByte": {
      "low": 0,
      "medium": 0,
      "high": 0
    },
    "minFeePerByte": 1000,
    "feeTokenID": "0000000000000000",
  },
  "meta": {
    "lastUpdate": 1659974881,
    "lastBlockHeight": 19264798,
    "lastBlockID": "fbcb48456086d11dc797321a672cd964cebee85296ec8c7bd6ed036f88f27fb1"
  }
}
```

## `update.metadata`

Updates about recent metadata changes.

### Payload

```jsonc
{
  "mainnet": ["Lisk", "Colecti"],
  "testnet": ["Lisk", "Enevti"],
  "betanet": ["Lisk"],
}
```
