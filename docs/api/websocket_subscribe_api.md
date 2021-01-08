# Lisk Service Subscribe API Documentation

The Lisk Service is a web application that interacts with the whole Lisk ecosystem in various aspects: by accessing blockchain data, storing users' private data, retrieving and storing market data and interacting with social media.

The Subscribe API is sometimes called publish/subscribe or Event-Driven API. The biggest difference between Event-Driven and regular REST API is not only technical: in practice, they use two-way streaming connection, which means that not only client can request server for a data (and potential updates), but also the server can notify the client about new data instantly, as they arrive.

Lisk Service leverages the two-way communication approach by utilizing the WebSocket library responsible for updating users about changes in the blockchain network and markets.

## <a name='table-of-contents'></a>Table of Contents

<!-- vscode-markdown-toc -->
* [Table of Contents](#table-of-contents)
* [Access paths and compatibility](#access-paths-and-compatibility)
* [Endpoint Logic](#endpoint-logic)
* [Responses](#responses)
* [Date Format](#date-format)
* [Sample client implementations](#sample-client-implementations)
    * [Node.js](#node.js)
* [`update.block`](#`update.block`)
    * [Response](#response)
* [`update.round`](#`update.round`)
    * [Response](#response-1)
* [`update.transactions.confirmed`](#`update.transactions.confirmed`)
    * [Response](#response-2)
* [`update.transactions.unconfirmed`](#`update.transactions.unconfirmed`)
    * [Response](#response-3)
* [`update.transactions.<Lisk_ID>` _(not implemented)_](#`update.transactions.<lisk_id>`-_(not-implemented)_)
    * [Response](#response-4)
* [`update.peers.connected` _(not implemented)_](#`update.peers.connected`-_(not-implemented)_)
    * [Response](#response-5)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## <a name='access-paths-and-compatibility'></a>Access paths and compatibility

The blockchain update API can be accessed by the following path `https://service.lisk.io/blockchain`.

The market update API can be accessed by the following path `https://service.lisk.io/market`.

You can also access the testnet network by using the `https://testnet-service.lisk.io` address.

The Lisk Service WebSocket API uses the `socket.io` library and it is compatible with JSON-RPC 2.0 standard. The specification below contains numerous examples how to use the API in practice.

## <a name='endpoint-logic'></a>Endpoint Logic

The logic of the endpoints comes as follows: the method naming is always based on the following pattern: `<action>.<entity>`, where the `action` is equivalent to method type performed on server (ie. update) and `entity` is a part of the application logic, ex. `accounts`, `transactions`.

## <a name='responses'></a>Responses

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

## <a name='date-format'></a>Date Format

In the contrary to the original Lisk Core API, all timestamps used by the Lisk Service are in the UNIX timestamp format. The blockchain dates are always expressed as integers and the epoch date is equal to the number of seconds since 1970-01-01 00:00:00.

## <a name='sample-client-implementations'></a>Sample client implementations

### <a name='node.js'></a>Node.js

```javascript
const io = require('socket.io-client');
const connection = io.connect('https://service.lisk.io/blockchain', { transports: ['websocket'] });
connection.on('update.block', (block) => { (...) });
```

# Blockchain updates (`/blockchain`)

## <a name='`update.block`'></a>`update.block`

Updates about a newly forged block with its all data.

### <a name='response'></a>Response

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

## <a name='`update.round`'></a>`update.round`

Updates about the forging delegates for the next round.

### <a name='response-1'></a>Response

```jsonc
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

## <a name='`update.transactions.confirmed`'></a>`update.transactions.confirmed`

Updates about transactions from the last block.

### <a name='response-2'></a>Response

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

## <a name='`update.transactions.unconfirmed`'></a>`update.transactions.unconfirmed`

Updates about unconfirmed transactions.

### <a name='response-3'></a>Response

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
