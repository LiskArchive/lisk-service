# Lisk Service Subscribe API Documentation

The Lisk Service is a web application that interacts with the whole Lisk ecosystem in various aspects: by accessing blockchain data, storing users' private data, retrieving and storing market data and interacting with social media.

The Subscribe API is sometimes called publish/subscribe or Event-Driven API. The biggest difference between Event-Driven and regular REST API is not only technical: in practice, they use two-way streaming connection, which means that not only client can request server for a data (and potential updates), but also the server can notify the client about new data instantly, as they arrive.

Lisk Service leverages the two-way communication approach by utilizing the WebSocket library responsible for updating users about changes in the blockchain network and markets.

## Table of Contents

TBD

## Access paths and compatibility

The blockchain update API can be accessed by the following path `https://service.lisk.io/blockchain`.

The market update API can be accessed by the following path `https://service.lisk.io/market`.

You can also access the testnet network by using the `https://testnet-service.lisk.io` address.

The Lisk Service WebSocket API uses the `socket.io` library and it is compatible with JSON-RPC 2.0 standard. The specification below contains numerous examples how to use the API in practice.

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

In the contrary to the original Lisk Core API, all timestamps used by the Lisk Service are in the UNIX timestamp format. The blockchain dates are always expressed as integers and the epoch date is equal to the number of seconds since 1970-01-01 00:00:00.

## Sample client implementations

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
        "id": "3226008563694255110",
        "height": 26998,
        "version": 1,
        "timestamp": 1573059290,
        "generatorAddress": "6214967903930344618L",
        "generatorPublicKey": "85b07e51ffe528f272b7eb734d0496158f2b0f890155ebe59ba2989a8ccc9a49",
        "payloadLength": 468,
        "payloadHash": "c38b0a05a6f10d40e5e7bb2d6a1508be9d45c508d53f525ba4b2d6b972fceac2",
        "blockSignature": "7405a0d0772fab3947a2e9ff3b60eb1afc857cd941e8a0f481e579f6c9888f4f6732a47e9d56dec082829fb9d78b7cc364a335daf26d9cbac0d98f7b1c3e1d04",
        "confirmations": 1,
        "previousBlockId": "631995364195044204",
        "numberOfTransactions": 4,
        "totalAmount": "400000000",
        "totalFee": "40000000",
        "reward": "500000000",
        "totalForged": "540000000"
        }
    ],
    "meta": {
        "count": 1,
        "timestamp": 1573059291
    }
}
```

## `update.round`

Updates about current round, delegates and their forging status.

```jsonc
{
    "data": {
        "participants": [
            {
                "address": "123L",
                "username": "genesis_12",
                "forgingStatusInRound": "DONE", // "DONE", "AWAITING", "MISSED",
                "forgedBlocks": 2,
                "forgedBlockIds": ["6258354802676165798", "9368354802426379221"],
            }
        ],
        "nextForgers": [
            {
            "address": "4935562234363081651L",
            "approval": "35.77",
            "missedBlocks": 157,
            "producedBlocks": 55222,
            "productivity": "99.72",
            "publicKey": "6122ac1fd71b437014ddbc4ec01e07879f5af1853536efaa0233bc12907c684b",
            "secondPublicKey": "6122ac1fd71b437014ddbc4ec01e07879f5af1853536efaa0233bc12907c684b",
            "rank": 93,
            "username": "genesis_84",
            "vote": "4630668157412954"
            }
        ],
    },
    "meta": {
        "update": 1565107927,
        "roundStart": 1565107927,
        "roundEnd": 1565107927,
        "blocksForged": 12
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
            "id": "12761961644475138241",
            "amount": "100000000",
            "fee": "10000000",
            "type": 0,
            "height": 26998,
            "blockId": "3226008563694255110",
            "timestamp": 1573059285,
            "senderId": "16313739661670634666L",
            "senderPublicKey": "c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f",
            "recipientId": "16313739661670634666L",
            "recipientPublicKey": "c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f",
            "signature": "8b93bddbc51411f45dd2be352496f0b4a8dcc37bdf632eb311d292c7f2de75e5182c1ac554f54031313a5c7f9fcfa091dee7790aa40c2ee96091ba52710b600e",
            "signatures": [],
            "confirmations": 1,
            "asset": {}
        },
        ...
    ],
    "meta": {
        "count": 4,
        "timestamp": 1573059291
    }
}
```

## `update.transactions.unconfirmed`

Updates about unconfirmed transactions.

### Response

```jsonc
{
    "data": [
        {
            "amount": "100000000",
            "recipientId": "16313739661670634666L",
            "senderPublicKey": "c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f",
            "type": 0,
            "fee": "10000000",
            "asset": {},
            "signature": "8b93bddbc51411f45dd2be352496f0b4a8dcc37bdf632eb311d292c7f2de75e5182c1ac554f54031313a5c7f9fcfa091dee7790aa40c2ee96091ba52710b600e",
            "id": "12761961644475138241",
            "senderId": "16313739661670634666L",
            "relays": 1
        }
    ],
    "meta": {
        "count": 1,
        "timestamp": 1573059285
    }
}
```
