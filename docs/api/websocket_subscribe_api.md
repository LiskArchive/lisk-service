# Lisk Service Subscribe API Documentation

The Lisk Service is a web application that interacts with the entire Lisk ecosystem in various aspects. For example, one key aspect is an update about blockchain events.

The Subscribe API is sometimes called publish/subscribe or Event-Driven API. The biggest difference between Event-Driven and regular REST API is not only technical. In practice, a two-way streaming connection is used, which means that not only can the client request the server for a data update, (and also potential updates) but also the server can notify the client about new data instantly as it arrives.

Lisk Service leverages the two-way communication approach by utilizing the WebSocket library responsible for updating users about changes in the blockchain network and markets.

## Table of Contents

- [Lisk Service Subscribe API Documentation](#lisk-service-subscribe-api-documentation)
  - [Table of Contents](#table-of-contents)
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
  - [`update.transactions.confirmed`](#updatetransactionsconfirmed)
    - [Response](#response-3)

## Access paths and compatibility

The blockchain update API can be accessed by the following path `https://service.lisk.io/blockchain`.

You might also be interested in accessing the `testnet` network by using the `https://testnet-service.lisk.io/blockchain` endpoint.

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
const connection = io.connect('https://service.lisk.io/blockchain', { transports: ['websocket'] });
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
      "id": "6258354802676165798",
      "height": 8344448,
      "version": 0,
      "timestamp": 85944650,
      "generatorAddress": "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
      "generatorPublicKey": "6e904b2f678eb3b6c3042acb188a607d903d441d61508d047fe36b3c982995c8",
      "generatorUsername": "genesis_13",
      "transactionRoot": "4e4d91be041e09a2e54bb7dd38f1f2a02ee7432ec9f169ba63cd1f193a733dd2",
      "signature": "a3733254aad600fa787d6223002278c3400be5e8ed4763ae27f9a15b80e20c22ac9259dc926f4f4cabdf0e4f8cec49308fa8296d71c288f56b9d1e11dfe81e07",
      "previousBlockId": "15918760246746894806",
      "numberOfTransactions": 15,
      "totalFee": "15000000",
      "reward": "50000000",
      "totalForged": "65000000",
      "totalBurnt": "10000000",
      "isFinal": true,
      "maxHeightPreviouslyForged": 68636,
      "maxHeightPrevoted": 68707,
      "seedReveal": "4021e5048af4c9f64ff2e12780af21f4"
    }
  ],
  "meta": {
    "count": 100,
    "offset": 25,
    "total": 43749
  },
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

## `update.transactions.confirmed`

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
