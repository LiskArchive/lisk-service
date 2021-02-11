# Lisk Service WebSocket JSON-RPC API Documentation

The Lisk Service is a web application that interacts with the whole Lisk ecosystem in various aspects: by accessing blockchain data, storing users' private data, retrieving and storing market data and interacting with social media.

> The main focus of this project is to provide data to Lisk blockchain users by serving them in standardized JSON format and exposing a public WebSocket-based JSON-RPC API. For RESTful API visit the [documentation page](http://lisk.io/docs).

## Table of Contents

   * [Lisk Service WebSocket JSON-RPC API Documentation](#lisk-service-websocket-json-rpc-api-documentation)
      * [Access paths and compatibility](#access-paths-and-compatibility)
      * [Endpoint Logic](#endpoint-logic)
      * [Responses](#responses)
      * [Date Format](#date-format)
      * [Multi-Requests](#multi-requests)
   * [Lisk Blockchain-related Endpoints](#lisk-blockchain-related-endpoints)
      * [Accounts](#accounts)
         * [get.accounts](#getaccounts)
         * [get.votes](#getvotes)
         * [get.voters](#getvoters)
      * [Blocks](#blocks)
         * [get.blocks](#getblocks)
      * [Delegates](#delegates)
         * [get.delegates](#getdelegates)
         * [get.delegates.next_forgers](#getnext_forgers)
      * [Peers](#peers)
         * [get.peers](#getpeers)
      * [Transactions](#transactions)
         * [get.transactions](#gettransactions)
         * [get.transactions.statistics.day](#gettransactionsstatisticsday)
         * [get.transactions.statistics.month](#gettransactionsstatisticsmonth)
      * [Network](#network)
         * [get.network.status](#getnetworkstatus)
         * [get.network.statistics](#getnetworkstatistics)
         * [get.search](#getsearch)

## Access paths and compatibility

The WebSocket API can be accessed by the `wss://service.lisk.io/rpc-v1`.

You can also access the testnet network by `wss://testnet-service.lisk.io/rpc-v1`.

The Lisk Service WebSocket API uses the `socket.io` library and it is compatible with JSON-RPC 2.0 standard. The specification below contains numerous examples how to use the API in practice.

## Endpoint Logic

The logic of the endpoints comes as follows: the method naming is always based on the following pattern: `<action>.<entity>`, where the action is equivalent to HTTP standard (GET, POST, PUT, etc.) and `entity` is a part of the application logic, ex. `accounts`, `transactions` and so on.

## Responses

All responses are returned in the JSON format - application/json.

Each API request has the following structure:

```
{
    "jsonrpc": "2.0",    // standard JSON-RPC envelope
    "result": {
        "data": {}, // Contains the requested data
        "meta": {}, // Contains additional metadata, e.g. the values of `limit` and `offset`
    },
    "id": 1    // Number of response in chain
}
```

## Date Format

In the contrary to the original Lisk Core API, all timestamps used by the Lisk Service are in the UNIX timestamp format. The blockchain dates are always expressed as integers and the epoch date is equal to the number of seconds since 1970-01-01 00:00:00.


## Multi-Requests

A request can consist of an array of multiple responses.

```
[
    { "jsonrpc": "2.0", "id": 1, "method": "get.blocks", "params": {} },
    { "jsonrpc": "2.0", "id": 2, "method": "get.transactions", "params": { "height": "16" } },
    { "jsonrpc": "2.0", "id": 3, "method": "get.accounts", "params": { "id": "123L"} }
]
```

Response

```
[
    {
        "jsonrpc": "2.0",
        "result": {
            "data": [
                ... // List of blocks
            ],
            "meta": {},
        },
        "id": 1
    },
    {
        "jsonrpc": "2.0",
        "result": {
            "data": [
                ... // List of transactions
            ],
            "meta": {},
        },
        "id": 2
    },
    {
        "jsonrpc": "2.0",
            "data": [
                ... // List of accounts
            ],
            "meta": {},
        },
        "id": 3
    }
]
```


# Lisk Blockchain-related Endpoints

## Accounts

### get.accounts

Retrieves account details based on criteria defined by params.

_Supports pagination._

#### Parameters

| Parameter&nbsp;name | Example                | Description                    |
| ------------------- | -----------------------| ------------------------------ |
| `address`           | `4935562234363081651L` | Lisk account address           |
| `publickey`         | `968ba2...af341b`      | Public key to query            |
| `secpubkey`         | `968ba2...af341b`      | Second public key to query     |
| `username`          | `genesis_12`           | Delegate username to query     |
| `limit`             | `0`                    | Number of requested items      |
| `offset`            | `25`                   | Number of items to skip        |
| `sort`              | `name:desc`            | Sorting order<br>_Available values:_ `balance:asc`, `balance:desc`<br>_Default value:_ `balance:asc` |

#### Response

```
[
  {
    "data": [
      {
        "address": "4935562234363081651L",
        "publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
        "secondPublicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
        "balance": "4448642000",
        "delegate": {
          "approval": "35.77",
          "missedBlocks": 157,
          "producedBlocks": 55222,
          "productivity": "99.72",
          "rank": 93,
          "rewards": "109500000000",
          "username": "genesis_84",
          "vote": "4630668157412954"
        },
        "knowledge": {
          "owner": "genesis_84",
          "description": "Genesis wallet"
        },
        "multisignatureAccount": {
          "lifetime": 48,
          "minimalNumberAcccounts": 2,
          "members": [
            {
              "address": "4935562234363081651L",
              "publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
              "secondPublicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
              "balance": "4448642000",
              "unconfirmedSignature": 0
            }
          ]
        },
        "multisignatureMemberships": [
          {
            "address": "4935562234363081651L",
            "balance": "4448642000",
            "lifetime": 48,
            "min": 2,
            "publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
            "secondPublicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
          }
        ],
        "transactionCount": {
          "incoming": "216",
          "outgoing": "1581"
        },
        "unconfirmedMultisignatureMemberships": [
          {
            "address": "4935562234363081651L",
            "publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
            "secondPublicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
            "balance": "4448642000",
            "unconfirmedSignature": 0
          }
        ]
      }
    ],
    "meta": {
      "count": 100,
      "offset": 25,
      "total": 43749
    }
  }
]
```

#### Examples

Get address with certain Lisk account ID
```
{
    "method": "get.accounts",
    "params": {
        "address": "123L"
    }
}
```

> TODO: Add some more examples

### get.votes_sent

Retrieves votes for a single account based on address, public key or delegate name.

_Supports pagination._

#### Parameters

| Parameter&nbsp;name | Example                | Description                    |
| ------------------- | -----------------------| ------------------------------ |
| `address`           | `4935562234363081651L` | Lisk account address           |
| `publickey`         | `968ba2...af341b`      | Public key to query            |
| `secpubkey`         | `968ba2...af341b`      | Second public key to query     |
| `username`          | `genesis_12`           | Delegate username to query     |
| `limit`             | `0`                    | Number of requested items      |
| `offset`            | `25`                   | Number of items to skip        |

#### Response

```
{
  "data": [
    {
      "address": "4935562234363081651L",
      "publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
      "balance": 1081560729258,
      "username": "liskhq"
    }
  ],
  "meta": {
    "count": 100,
    "offset": 25,
    "total": 43749
  }
}
```

#### Examples

```
{
    "method": "get.votes_sent",
    "params": {
        "address": "4935562234363081651L"
    }
}
```

### get.votes_received

#### Parameters

| Parameter&nbsp;name | Example                | Description                    |
| ------------------- | -----------------------| ------------------------------ |
| `address`           | `4935562234363081651L` | Lisk account address           |
| `publickey`         | `968ba2...af341b`      | Public key to query            |
| `secpubkey`         | `968ba2...af341b`      | Second public key to query     |
| `username`          | `genesis_12`           | Delegate username to query     |
| `limit`             | `0`                    | Number of requested items      |
| `offset`            | `25`                   | Number of items to skip        |

#### Response

```
{
  "data": [
    {
      "address": "4935562234363081651L",
      "publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
      "balance": 1081560729258,
      "username": "liskhq"
    }
  ],
  "meta": {
    "count": 100,
    "offset": 25,
    "total": 43749
  }
}
```

#### Examples

```
{
    "method": "get.votes_received",
    "params": {
        "address": "4935562234363081651L"
    }
}
```


## Blocks

### get.blocks

Retrieves block details based on criteria defined by params.

_Supports pagination._

#### Parameters

| Parameter&nbsp;name      | Example                | Description                    |
| ------------------- | ---------------------- | ------------------------------ |
| `id`                | `6258354802676165798`  | Block id to query              |
| `height`            | `1`                    | Current height of the network  |
| `from`              | `85944650`             | Starting UNIX timestamp        |
| `to`                | `85944650`             | Ending UNIX timestamp          |
| `address`           | `4935562234363081651L` | Lisk address, public key or account name |
| `limit`             | `0`                    | Number of requested items      |
| `offset`            | `25`                   | Number of items to skip        |
| `sort`              | `height:asc`           | Sorting order<br>Available values: `height:asc`, `height:desc`, `totalAmount:asc`, `totalAmount:desc`, `totalFee:asc`, `totalFee:desc`, `timestamp:asc`, `timestamp:desc`<br/>Default value: `height:desc` |

#### Response

```
{
  "data": [
    {
      "id": "6258354802676165798",
      "height": 8344448,
      "version": 0,
      "timestamp": 85944650,
      "payloadLength": 117,
      "generatorAddress": "7749538982696555450L",
      "generatorPublicKey": "6e904b2f678eb3b6c3042acb188a607d903d441d61508d047fe36b3c982995c8",
      "generatorUsername": "genesis_13",
      "payloadHash": "4e4d91be041e09a2e54bb7dd38f1f2a02ee7432ec9f169ba63cd1f193a733dd2",
      "blockSignature": "a3733254aad600fa787d6223002278c3400be5e8ed4763ae27f9a15b80e20c22ac9259dc926f4f4cabdf0e4f8cec49308fa8296d71c288f56b9d1e11dfe81e07",
      "confirmations": 200,
      "previousBlockId": "15918760246746894806",
      "numberOfTransactions": 15,
      "totalAmount": "150000000",
      "totalFee": "15000000",
      "reward": "50000000",
      "totalForged": "65000000"
    }
  ],
  "meta": {
    "count": 100,
    "offset": 25,
    "total": 43749
  },
  "links": {}
}
```

## Delegates

### get.delegates

Retrieves delegate list with their details based on criteria.

_Supports pagination._

#### Parameters

| Parameter&nbsp;name | Example                | Description                    |
| ------------------- | ---------------------- | ------------------------------ |
| `address`           | `4935562234363081651L` | Lisk account address           |
| `publickey`         | `6122ac...7c684b`      | Public key to query            |
| `secpubkey`         | `6122ac...7c684b`      | Second public key to query     |
| `username`          | `genesis_84`           | Delegate username to query     |
| `search`            | `genesis`              | Delegate name full text search phrase |
| `limit`             | `50`                   | Number of requested items      |
| `offset`            | `25`                   | Number of items to skip        |
| `sort`              | `productivity:asc`     | Sorting order<br>Available values: `username:asc`, `username:desc`, `rank:asc`, `rank:desc`, `productivity:asc`, `productivity:desc`, `missedBlocks:asc`, `missedBlocks:desc`<br>Default value: `rank:asc` |

#### Response

```
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
      "rewards": "109500000000",
      "username": "genesis_84",
      "vote": "4630668157412954"
    }
  ],
  "meta": {
    "count": 100,
    "offset": 25,
    "total": 43749
  }
}
```

#### Examples

```
{
    "method": "get.delegates",
    "params": {
        "address": "4935562234363081651L"
    }
}
```

> TODO: More examples

### get.delegates.next_forgers

Retrieves next forgers with details in the current round.

_Supports pagination._

#### Parameters

| Parameter&nbsp;name | Example   | Description                    |
| ------------------- | ----------| ------------------------------ |
| `limit`             | `50`      | Limit applied to results       |
| `offset`            | `25`      | Number of items to skip        |

#### Response

```
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
    "count": 100,
    "offset": 25,
    "total": 43749
  },
}
```

#### Examples

Get 20 items, skip first 50

```
{
    "method": "get.delegates.next_forgers",
    "params": {
        "limit": "20",
        "offset": "50"
    }
}
```

## Peers

### get.peers

Retrieves network peers with details based on criteria.

_Supports pagination._

#### Parameters

| Parameter&nbsp;name | Example             | Description                       |
| ------------------- | --------------------| --------------------------------- |
| `ip`                | `127.0.0.1`         | IP of the node or delegate        |
| `httpPort`          | `8000`              | HTTP port of the node or delegate |
| `wsPort`            | `8001`              | Web socket port for the node or delegate |
| `os`                | `debian`            | OS of the node                    |
| `version`           | `v0.8.0`            | Lisk version of the node          |
| `state`             | `2`                 | Current state of the network      |
| `height`            | `8350681`           | Current height of the network     |
| `broadhash`         | `258974...3db1ea`   | Broadhash of the network          |
| `limit`             | `0`                 | Number of requested items<br>_Default value:_ `10` |
| `offset`            | `25`                | Number of items to skip<br>_Default value:_ `0` |
| `sort`              | `version:asc`       | Sorting order<br>_Available values:_ `height:asc`, `height:desc`, `version:asc`, `version:desc`<br>_Default value:_ `height:desc` |

#### Response

```
{
  "data": [
    {
      "ip": "127.0.0.1",
      "httpPort": 8000,
      "wsPort": 8001,
      "os": "debian",
      "version": "v0.8.0",
      "state": v0.8.0,
      "height": 8350681,
      "broadhash": "258974416d58533227c6a3da1b6333f0541b06c65b41e45cf31926847a3db1ea",
      "nonce": "sYHEDBKcScaAAAYg",
      "location": {
        "city": "Berlin",
        "countryCode": "DE",
        "countryName": "Germany",
        "hostname": "host.210.239.23.62.rev.coltfrance.com",
      }
    }
  ],
  "meta": {
    "count": 100,
    "offset": 25,
    "total": 43749
  }
}
```

#### Examples

Get hosts with certain IP

```
{
    "method": "get.peers",
    "params": {
        "ip": "210.239.23.62"
    }
}
```


## Transactions

### get.transactions

Retrieves network transactions by criteria defined by params.

_Supports pagination._

#### Parameters

| Parameter&nbsp;name | Example                | Description                    |
| ------------------- | -----------------------| ------------------------------ |
| `id`                | `222675625422353767`   | Transaction id to query        |
| `type`              | `0`                    | Transaction type (0-7)         |
| `address`           | `4935562234363081651L` | Lisk address, public key or account name |
| `sender`            | `4935562234363081651L` | Lisk address, public key or account name (senderId) |
| `recipient`         | `4935562234363081651L` | Lisk address, public key or account name (recipientId) |
| `min`               | `150000000`            | Minimum transaction amount in Beddows |
| `max`               | `150000000`            | Maximum transaction amount in Beddows |
| `from`              | `28227090`             | Starting UNIX timestamp        |
| `to`                | `28227090`             | Ending UNIX timestamp          |
| `block`             | `6258354802676165798`  | Block id to query              |
| `height`            | `8350681`              | Height of the network          |
| `limit`             | `50`                   | Number of requested items      |
| `offset`            | `25`                   | Number of items to skip        |
| `sort`              | `type:desc`            | Sorting order<br>_Available values:_ `amount:asc`, `amount:desc`, `fee:asc`, `fee:desc`, `type:asc`, `type:desc`, `timestamp:asc`, `timestamp:desc`<br>_Default value:_ `timestamp:desc` |

#### Response

```
{
  "data": [
    {
      "id": "222675625422353767",
      "amount": "150000000",
      "fee": "1000000",
      "type": 0,
      "height": 8350681,
      "blockId": "6258354802676165798",
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
      "confirmations": 0,
      "asset": {},
      "receivedAt": "2019-08-02T08:24:45.009Z",
      "relays": 0,
      "ready": false
    }
  ],
  "meta": {
    "count": 100,
    "offset": 25,
    "total": 43749
  }
}
```

#### Examples

Get transaction by transaction ID

```
{
    "method": "get.transactions",
    "params": {
        "id": "222675625422353767"
    }
}
```

Get last 25 transactions for account 14935562234363081651L

```
{
    "method": "get.transactions",
    "params": {
        "address": "14935562234363081651L",
        "limit": "25"
    }
}
```

### get.transactions.statistics.day

Retrieves daily network transactions statistics for time spans defined by params.

_Supports pagination._

#### Parameters

| Parameter&nbsp;name | Example                | Description                    |
| ------------------- | -----------------------| ------------------------------ |
| `limit`             | `50`                   | Number of requested items (days)|
| `offset`            | `25`                   | Number of items to skip        |

#### Response

```
{
  "data":{
    "timeline":[
      {
        "date":"2019-11-27",
        "transactionCount":503,
        "volume":"20087361290583",
        "timestamp":1574812800
      },
      {
        "date":"2019-11-26",
        "transactionCount":363,
        "volume":"61577610129315",
        "timestamp":1574726400
      },
      {
        "date":"2019-11-25",
        "transactionCount":1211,
        "volume":"27747743232112",
        "timestamp":1574640000
      },
      {
        "date":"2019-11-24",
        "transactionCount":4431,
        "volume":"96306777872811",
        "timestamp":1574553600
      },
      {
        "date":"2019-11-23",
        "transactionCount":609,
        "volume":"20665122707837",
        "timestamp":1574467200
      }
    ],
    "distributionByType":{
      "0":7063,
      "1":1,
      "2":2,
      "3":51
    },
    "distributionByAmount":{
      "1_10":5042,
      "10_100":585,
      "100_1000":542,
      "1000_10000":236,
      "10000_100000":52,
      "100000_1000000":3,
      "0.1_1":657
    }
  },
  "meta":{
    "limit":7,
    "offset":0,
    "aggregateBy":"day",
    "dateFormat":"YYYY-MM-DD",
    "dateFrom":"2019-11-23",
    "dateTo":"2019-11-27"
  },
  "links":{

  }
}
```

#### Examples

Get transaction statistics for past 7 days,

```
{
    "method": "get.transactions.statistics.day",
    "params": {
        "limit": 7,
    }
}
```

### get.transactions.statistics.month

Retrieves monthly network transactions statistics for time spans defined by params.

_Supports pagination._

#### Parameters

| Parameter&nbsp;name | Example                | Description                    |
| ------------------- | -----------------------| ------------------------------ |
| `limit`             | `12`                   | Number of requested items (months)|
| `offset`            | `0`                   | Number of items to skip        |

#### Response

```
{
  "data":{
    "timeline":[
      {
        "date":"2019-12",
        "transactionCount":503,
        "volume":"20087361290583",
        "timestamp":1574812800
      },
      {
        "date":"2019-11",
        "transactionCount":363,
        "volume":"61577610129315",
        "timestamp":1574726400
      },
      {
        "date":"2019-10",
        "transactionCount":1211,
        "volume":"27747743232112",
        "timestamp":1574640000
      },
    ],
    "distributionByType":{
      "0":7063,
      "1":1,
      "2":2,
      "3":51
    },
    "distributionByAmount":{
      "1_10":5042,
      "10_100":585,
      "100_1000":542,
      "1000_10000":236,
      "10000_100000":52,
      "100000_1000000":3,
      "0.1_1":657
    }
  },
  "meta":{
    "limit":3,
    "offset":0,
    "aggregateBy":"month",
    "dateFormat":"YYYY-MM",
    "dateFrom":"2019-10",
    "dateTo":"2019-12"
  },
  "links":{

  }
}
```

#### Examples

Get transaction statistics for past 12 months,

```
{
    "method": "get.transactions.statistics.month",
    "params": {
        "limit": 12,
    }
}
```

## Network

### get.network.status

Retrieves network details and constants such as network height, broadhash, fees, reward amount etc.

#### Parameters

No parameters.

#### Response

```
{
  "broadhash": "258974416d58533227c6a3da1b6333f0541b06c65b41e45cf31926847a3db1ea",
  "height": 123,
  "networkHeight": 123,
  "epoch": "2016-05-24T17:00:00.000Z",
  "milestone": "500000000",
  "nethash": "ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511",
  "supply": "10575384500000000",
  "reward": "500000000",
  "fees": {
    "send": "10000000",
    "vote": "100000000",
    "secondSignature": "500000000",
    "delegate": "2500000000",
    "multisignature": "500000000",
    "dappRegistration": "2500000000",
    "dappWithdrawal": "10000000",
    "dappDeposit": "10000000"
  }
}
```

#### Examples

```
{
    "method": "get.network.status"
}
```

### get.network.statistics

Retrieves network statistics such as number of peers, node versions, heights etc.

#### Parameters

No parameters.

#### Response

```
{
  "data": {
    "basic": {
      "connectedPeers": 134,
      "disconnectedPeers": 48,
      "totalPeers": 181
    },
    "height": {
      "7982598": 24
    },
    "coreVer": {
      "1.4.0": 12,
      "1.5.0": 41
    },
    "os": {
      "linux3.10": 33,
      "linux4.4": 71
    }
  },
  "meta": {},
  "links": {}
}
```

#### Examples

```
{
    "method": "get.network.statistics"
}
```

### get.search

Performs search among the delegates, accounts, public keys, transactions, blocks and height.

#### Parameters

| Parameter&nbsp;name | Example             | Description        |
| ------------------- | --------------------| ------------------ |
| `q`             | `genesis`           | Search string      |

#### Response

```
{
  "results": [
    {
      "score": 0.82,
      "description": "genesis_10",
      "id": "1864409191503661202L",
      "type": "address"
    }
  ],
  "meta": {}
}
```

#### Examples

Get entities containing `genesis` string.

```
{
    "method": "get.search",
    "params": {
        "q": "genesis"
    }
}
```
