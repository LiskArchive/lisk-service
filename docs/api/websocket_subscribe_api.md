# Lisk Service Subscribe API Documentation

The Lisk Service is a web application that interacts with the entire Lisk ecosystem in various aspects. For example, one key aspect is an update about blockchain events.

The Subscribe API is sometimes called publish/subscribe or Event-Driven API. The biggest difference between Event-Driven and regular REST API is not only technical. In practice, a two-way streaming connection is used, which means that not only can the client request the server for a data update, (and also potential updates) but also the server can notify the client about new data instantly as it arrives.

Lisk Service leverages the two-way communication approach by utilizing the WebSocket library responsible for updating users about changes in the blockchain network and markets.

## <a name='table-of-contents'></a>Table of Contents

<!-- vscode-markdown-toc -->
* [Access paths and compatibility](#access-paths-and-compatibility)
* [Endpoint Logic](#endpoint-logic)
* [Responses](#responses)
* [Date Format](#date-format)
* [Example of a client implementation](#example-of-a-client-implementation)
    * [Node.js](#node.js)
* [Emitted blockchain updates](#blockchain-updates-\(`/blockchain`\))
    * [`update.block`](#`update.block`)
    * [`update.round`](#`update.round`)
    * [`update.transactions.confirmed`](#`update.transactions.confirmed`)
    * [`update.transactions.unconfirmed`](#`update.transactions.unconfirmed`)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## <a name='access-paths-and-compatibility'></a>Access paths and compatibility

The blockchain update API can be accessed by the following path `https://service.lisk.io/blockchain`.

You might also be interested in accessing the `testnet` network by using the `https://testnet-service.lisk.io/blockchain` endpoint.

**Important:** The Lisk Service WebSocket API uses the `socket.io` library. This implementation is compatible with the version 2.0 of `socket.io` library. Using the wrong major version might result in a broken connection and messages not being passed.

The specification below contains numerous examples how to use the API in practice.

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

On the contrary to the original Lisk Core API, all timestamps used by the Lisk Service are in the UNIX timestamp format. The blockchain dates are always expressed as integers and the epoch date is equal to the number of seconds since 1970-01-01 00:00:00.

## <a name='example-of-a-client-implementation'></a>Example of a client implementation

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
    id: "6286637019365913992",
    version: 1,
    timestamp: 146010410,
    height: 12659996,
    numberOfTransactions: 0,
    totalAmount: "0",
    totalFee: "0",
    reward: "100000000",
    payloadLength: 0,
    payloadHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    generatorPublicKey: "bfd925085aeb9d2d21973363d6a3e8d394b25116e252b4db701e3dabe319b016",
    blockSignature: "7e57deaf35bdf6ec804a402f04aaca6e70ecb1a928d28e98277219fa9caa5a770b0dea3ecf402cdfc35c7b8a84d1611a5b794d70bf3c29d51c28b8ded3b5920c",
    confirmations: 1,
    totalForged: "100000000",
    generatorAddress: "3865707283477759335L",
    previousBlockId: "9424602178629894603",
    unixTimestamp: 1610119610
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
