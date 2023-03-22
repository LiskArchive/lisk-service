# Lisk Service Subscribe API Documentation

The Lisk Service is a web application that interacts with the entire Lisk ecosystem in various aspects. For example, one key aspect is an update about blockchain events.

The Subscribe API is sometimes called publish/subscribe or Event-Driven API. The biggest difference between Event-Driven and regular REST API is not only technical. In practice, a two-way streaming connection is used, which means that not only can the client request the server for a data update, (and also potential updates) but also the server can notify the client about new data instantly as it arrives.

Lisk Service leverages the two-way communication approach by utilizing the WebSocket library responsible for updating users about changes in the blockchain network and markets.

## Table of Contents

- [Lisk Service Subscribe API Documentation](#lisk-service-subscribe-api-documentation)
  - [Access paths and compatibility](#access-paths-and-compatibility)
  - [Endpoint Logic](#endpoint-logic)
  - [Responses](#responses)
  - [Date Format](#date-format)
  - [Example of a client implementation](#example-of-a-client-implementation)
    - [Node.js](#nodejs)
- [Blockchain updates (`/blockchain`)](#blockchain-updates-blockchain)
  - [`update.block`](#updateblock)
    - [Response](#response)
  - [`update.round`](#updateround)
    - [Response](#response-1)
  - [`update.forgers`](#updateforgers)
    - [Response](#response-2)
  - [`update.transactions`](#updatetransactions)
    - [Response](#response-3)
  - [`update.fee_estimates`](#updatefee_estimates)
    - [Response](#response-4)

## Access paths and compatibility

The blockchain update API can be accessed by the following path `https://service.lisk.com/blockchain`.

You might also be interested in accessing the `testnet` network by using the `https://testnet-service.lisk.com/blockchain` endpoint.

**Important:** The Lisk Service WebSocket API uses the `socket.io` library. This implementation is compatible with the version 2.0 of `socket.io` library. Using the wrong major version might result in a broken connection and messages not being passed.

The specification below contains numerous examples how to use the API in practice.

## Endpoint Logic

The logic of the endpoints comes as follows: the method naming is always based on the following pattern: `<action>.<entity>`, where the `action` is equivalent to method type performed on server (ie. update) and `entity` is a part of the application logic, ex. `accounts`, `transactions`.

## Responses

All responses are returned in the JSON format - application/json.

Each API request has the following structure:

```jsonc
{
    "data": {}, // Contains the requested data
    "meta": {
        "count": <integer>, // number of items
        "timestamp": <timestamp>, // timestamp in seconds
        ...               // other metadata
    },
}
```

## Date Format

On the contrary to the original Lisk Core API, all timestamps used by the Lisk Service are in the UNIX timestamp format. The blockchain dates are always expressed as integers and the epoch date is equal to the number of seconds since 1970-01-01 00:00:00.

## Example of a client implementation

### Node.js

```javascript
const io = require('socket.io-client');
const connection = io.connect('https://service.lisk.com/blockchain', { transports: ['websocket'] });
connection.on('update.block', (block) => { (...) });
```

# Blockchain updates (`/blockchain`)

## `update.block`

Updates about a newly forged block with its all data.

### Response

```jsonc
{
  "data": [
    {
      "id": "64829af74cdeaa696e4fdef3d7a498b816c8c2e088ecd6a4b59df1df8370c650",
      "height": 12464,
      "version": 2,
      "timestamp": 1622816707,
      "generatorAddress": "lskq847deet5ohzujm6s5t9adeotvmdo7pq4y36nz",
      "generatorPublicKey": "09bafa700435af1b77ad1743e1e9df4157019dccca2fae0986e8e9431ed3e074",
      "generatorUsername": "genesis_45",
      "transactionRoot": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "signature": "db2331a34dc93ca87762732108c67d8fe3bf725cf6f5c73290495d5f3a73a80227df36f291e259b7ae720fc0c7d27a213c5faa7cb5524e2c77ee8881ffdb1309",
      "previousBlockId": "940c71fed31d45e5087ad63d494224d3417e32f44ddef6c182dfd0258994e3ea",
      "numberOfTransactions": 0,
      "totalForged": "500000000",
      "totalBurnt": "0",
      "totalFee": "0",
      "reward": "500000000",
      "isFinal": false,
      "maxHeightPreviouslyForged": 12458,
      "maxHeightPrevoted": 12395,
      "seedReveal": "de2646e55ae279b17980823c8917078d"
    }
  ],
  "meta": {
    "count": 1,
    "offset": 0,
    "total": 12464
  }
}
```

## `update.round`

Updates about the forging delegates for the next round.

### Response

```jsonc
{
  "data": [
    {
      "username": "genesis_51",
      "totalVotesReceived": "1006000000000",
      "address": "c6d076ed541ca20869a1398a9d28c645ac8a8719",
      "minActiveHeight": 27605,
      "isConsensusParticipant": true,
      "nextForgingTime": 1607521557
    },
  ],
  "meta": {
    "count": 10,
    "offset": 20,
    "total": 103
  },
}
```

## `update.forgers`

Updates the current forgers' list, so the current forger is on the first position.

### Response

```jsonc
{
  "data": [
    {
      "username": "genesis_45",
      "totalVotesReceived": "1000000000000",
      "address": "lskq847deet5ohzujm6s5t9adeotvmdo7pq4y36nz",
      "minActiveHeight": 1,
      "isConsensusParticipant": true,
      "nextForgingTime": 1622816707
    },
    // ...
  ],
  "meta": {
    "count": 25,
    "offset": 0,
    "total": 103
  }
}
```

## `update.transactions`

Updates about transactions from the last block.

### Response

```jsonc
{
  "data": [
    {
      "id": "222675625422353767",
      "moduleAssetId": "2:0",
      "moduleAssetName": "token:transfer",
      "fee": "1000000",
      "nonce": "0",
      "block": {  // optional
        "id": "6258354802676165798",
        "height": 8350681,
        "timestamp": 28227090,
      },
      "sender": {
        "address": "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
        "publicKey": "2ca9a7...c23079",
        "username": "genesis_51",
      },
      "signatures": [ "72c9b2...36c60a" ],
      "confirmations": 0,
      "asset": {  // Depends on operation
        "amount": "150000000",
        "recipient": {
          "address": "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
          "publicKey": "2ca9a7...c23079",
          "username": "genesis_49",
        },
        "data": "message"
      },
      "relays": 0,
      "isPending": false
    }
  ],
  "meta": {
    "count": 100,
    "offset": 25,
    "total": 43749
  },
}
```

## `update.fee_estimates`

Updates about recent fee estimates.

### Response

```jsonc
{
  "data": {
    "feeEstimatePerByte": {
      "low": 0,
      "medium": 0,
      "high": 0
    },
    "baseFeeByName": {
      "dpos:registerDelegate": "1000000000"
    },
    "minFeePerByte": 1000
  },
  "meta": {
    "lastUpdate": 1623755357,
    "lastBlockHeight": 4996,
    "lastBlockId": "03237f191c8acd0077fc897213973c25ed086c1b5e78dccb4cc1c4dd83a00e21"
  }
}
```
