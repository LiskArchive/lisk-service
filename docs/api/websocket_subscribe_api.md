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

```json
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

```json
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

## `update.delegates.forging` _(not implemented)_

Updates about forging delegates, first 101 delegates by voting power.

### Response

```json
{
    "data": [
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
    "meta": {
        "update": 1565107927,
        "count": 101
    },
}
```

## `update.round`

Updates about the forging delegates for the next round.

```json
{
  "nextForgers": [
        "9447508130077835324L",
        "923992554593700306L",
        "9164804013838025941L",
        "9077548379631877989L",
        ...
        ...
        "10452881617068866990L",
        "10431315846496304288L",
        "10045031187186962062L",
        "10016685355739180605L",
    ],
}
```

## `update.forgers`

Updates the current forgers' list, so the current forger is on the first position.

### Response

```jsonc
{
    "data": [
        {
            "address": "1492771550241913308L",
            "publicKey": "04c531ebe3b3c910abe89ad758636554396c92979e8c92dc04107404effac0fd",
            "username": "genesis_66"
        }
        ...
    ],
    "meta": {
        "count": 4,
        "timestamp": 1573059291
    }
}
```

## `update.transactions.confirmed`

Updates about transactions from the last block.

### Response

```json
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

```json
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

## `update.transactions.<Lisk_ID>` _(not implemented)_

Updates about unconfirmed transactions on per-account basis.

### Response

```json
{
    "data": [
        {
        "id": "222675625422353767",
        "amount": "150000000",
        "fee": "1000000",
        "type": 0,
        "timestamp": 28227090,
        "senderId": "4935562234363081651L",
        "senderPublicKey": "2ca9a7143fc721fdc540fef893b27e8d648d2288efa61e56264edf01a2c23079",
        "senderSecondPublicKey": "2ca9a7143fc721fdc540fef893b27e8d648d2288efa61e56264edf01a2c23079",
        "recipientId": "4935562234363081651L",
        "recipientPublicKey": "2ca9a7143fc721fdc540fef893b27e8d648d2288efa61e56264edf01a2c23079",
        "signature": "2821d93a742c4edf5fd960efad41a4def7bf0fd0f7c09869aed524f6f52bf9c97a617095e2c712bd28b4279078a29509b339ac55187854006591aa759784c205",
        "signSignature": "2821d93a742c4edf5fd960efad41a4def7bf0fd0f7c09869aed524f6f52bf9c97a617095e2c712bd28b4279078a29509b339ac55187854006591aa759784c205",
        "signatures": [
            "72c9b2aa734ec1b97549718ddf0d4737fd38a7f0fd105ea28486f2d989e9b3e399238d81a93aa45c27309d91ce604a5db9d25c9c90a138821f2011bc6636c60a"
        ],
        "asset": {},
        "receivedAt": "2019-08-07T10:12:25.938Z",
        "ready": false
        }
    ],
    "meta": {
        "update": 1565107927,
        "count": 5
    },
}
```

## `update.peers.connected` _(not implemented)_

Updates about active peers.

### Response

```json
{
    "data": [
        {
            "ip": "210.239.23.62",
            "httpPort": 8000,
            "wsPort": 8001,
            "os": "debian",
            "version": "v0.8.0",
            "state": 2,
            "height": 8350681,
            "broadhash": "258974416d58533227c6a3da1b6333f0541b06c65b41e45cf31926847a3db1ea",
            "nonce": "sYHEDBKcScaAAAYg",
            "location": {
                "city": "Berlin",
                "countryCode": "DE",
                "countryName": "Germany",
                "hostname": "host.210.239.23.62.rev.coltfrance.com",
                "ip": "210.239.23.62",
                "latitude": "52.5073",
                "longitude": "13.3643",
                "regionCode": "BE",
                "regionName": "Land Berlin",
                "timeZone": "Europe/Berlin",
                "zipCode": "10785"
            }
        }
    ],
    "meta": {
        "update": 1565107927,
        "count": 217
    },
}
```
