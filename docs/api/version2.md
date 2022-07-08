# Lisk Service HTTP API Documentation

The Lisk Service is a web application that interacts with the entire Lisk ecosystem in various aspects, such as accessing blockchain data, storing users' private data, retrieving and storing market data, and interacting with social media.

The main focus of this project is to provide data to Lisk blockchain users by serving them in standardized JSON format and exposing a public RESTful API. The project is planned to split into several smaller microservices. The overall strategy is to provide one microservice for one specific purpose.

As a pure backend project, it is designed to meet the requirements of frontend developers, especially Lisk Hub and Lisk Mobile.

The API can be accessed at `https://service.lisk.com`.

It is also possible to access the `testnet` network at `https://testnet-service.lisk.com`.

The Lisk Service API is compatible with RESTful guidelines. The specification below contains numerous examples of how to use the API in practice.

## Table of Contents

- [Lisk Service HTTP API Documentation](#lisk-service-http-api-documentation)
  - [Response format](#response-format)
  - [The Date Format](#the-date-format)
- [Lisk Blockchain-related Endpoints](#lisk-blockchain-related-endpoints)
  - [Accounts](#accounts)
    - [Account & delegate search](#account--delegate-search)
    - [Sent votes](#sent-votes)
    - [Received votes](#received-votes)
    - [Round forgers](#round-forgers)
  - [Blocks](#blocks)
    - [Block search](#block-search)
  - [Transactions](#transactions)
    - [Transaction search](#transaction-search)
    - [Transaction broadcast](#transaction-broadcast)
    - [Transaction statistics](#transaction-statistics)
    - [Transaction schema](#transaction-schema)
    - [Dynamic fees](#dynamic-fees)
  - [Network](#network)
    - [Network peers](#network-peers)
    - [Network status](#network-status)
    - [Network statistics](#network-statistics)
- [Off-chain Features](#off-chain-features)
  - [Market Prices](#market-prices)
  - [News Feed Aggregator](#news-feed-aggregator)
  - [Account History Export](#account-history-export)

## Response format

All responses are returned in the JSON format - `application/json`.

Each API request has the following structure:

```
{
  "data": {}, // Contains the requested data
  "meta": {}, // Contains additional metadata, e.g. the values of `limit` and `offset`
  "links": {} // Contains links to connected API calls from here, e.g. pagination links
}
```

## The Date Format

is different to the original Lisk Core API, as all timestamps used by the Lisk Service are now in the UNIX timestamp format. The blockchain dates are always expressed as integers, and the epoch date is equal to the number of seconds since 1970-01-01 00:00:00.

# Lisk Blockchain-related Endpoints

## Accounts

### Account & delegate search

Retrieves account details based on criteria defined by params.

_Supports pagination._

#### Endpoints

- HTTP `/api/v2/accounts`
- RPC `get.accounts`

#### Request parameters

Make the version 2 API able to retrieve data by those criteria.

| Parameter | Type             | Validation                                                 | Default        | Comment                                |
| --------- | ---------------- | ---------------------------------------------------------- | -------------- | -------------------------------------- |
| address   | String           | `/^lsk[a-hjkm-z2-9]{38}$//^[1-9]\d{0,19}[L\|l]$/`          | *(empty)*      | Resolves new and old address system    |
| publicKey | String           | `/^([A-Fa-f0-9]{2}){32}$/`                                 | *(empty)*      |
| username  | String           | `/^[a-z0-9!@$&_.]{1,20}$/`                                 | *(empty)*      |
| isDelegate | Boolean         | `true` or `false`                                          | *(empty)*      |
| status    | String           | `active`, `standby`, `banned`, `punished`, `non-eligible`              | *(empty)*      | Multiple choice possible i.e. `active,banned`
| search    | String           |                                  | *(empty)*      |
| limit     | Number           | `<1;100>`                                                  | 10             |
| offset    | Number           | `<0;+Inf>`                                                 | 0              |
| sort      | Array of strings | `["balance:asc", "balance:desc", "rank:asc", "rank:desc"]` | `balance:desc` | Rank is dedicated to delegate accounts |

#### Response example

200 OK

```jsonc
{
  "data": {
    "summary": {
      "address": "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
      "legacyAddress": "2841524825665420181L",
      "balance": "151146419900",
      "username": "liberspirita",
      "publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
      "isMigrated": true,
      "isDelegate": true,
      "isMultisignature": true,
    },
    "knowledge": {
      "owner": "Genesis Account",
      "description": ""
    },
    "token": {
      "balance": "151146419900"
    },
    "sequence": {
      "nonce": "11"
    },
    "keys": {
      "numberOfSignatures": 0,
      "mandatoryKeys": [],
      "optionalKeys": [],
      "members": [
        {
          "address": "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
          "publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
          "isMandatory": true,
        }
      ],
      "memberships": [
        {
          "address": "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
          "publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
          "username": "genesis_51",
        }
      ],
    },
    "dpos": {
      "delegate": {
        "username": "liberspirita",
        "pomHeights": [
          { "start": 123, "end": 456 },
          { "start": 789, "end": 1050 }
        ],
        "consecutiveMissedBlocks": 0,
        "lastForgedHeight": 68115,
        "isBanned": false,
        "voteWeight": "201000000000",
        "totalVotesReceived": "201000000000",
      },
      "sentVotes": [
        {
          "delegateAddress": "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
          "amount": "102000000000"
        },
        {
          "delegateAddress": "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
          "amount": "95000000000"
        }
      ],
      "unlocking": [
        {
          "delegateAddress": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
          "amount": "150000000",
          "height": {
            "start": "10",
            "end": "2010"
          }
        }
      ],
      "legacy": {
        "address": "2841524825665420181L", // legacyAddress
        "balance": "234500000" // Reclaimable balance
      }
    }
  },
  "meta": {
    "count": 1,
    "offset": 0
  },
  "links": {}
}
```

400 Bad Request
```jsonc
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>"
}
```

404 Not Found
```jsonc
{
  "error": true,
  "message": "Account <account_id> not found."
}

```

#### Examples

Get address with certain Lisk account ID
```
https://service.lisk.com/api/v2/accounts?address=lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu
```

Get all delegates
```
https://service.lisk.com/api/v2/accounts?isDelegate=true
```


### Sent votes

Retrieves votes for a single account based on address, public key, or delegate name.

#### Endpoints

- `HTTP /api/v2/votes_sent`
- `RPC get.votes_sent`

#### Request parameters


| Parameter | Type   | Validation                                              | Default   | Comment                          |
| --------- | ------ | ------------------------------------------------------- | --------- | -------------------------------- |
| address   | String | `/^lsk[a-hjkm-z2-9]{38}$//^[1-9]\d{0,19}[L\|l]$/`       | *(empty)* | Resolves only new address system |
| publicKey | String | `/^([A-Fa-f0-9]{2}){32}$/`                              | *(empty)* |
| username  | String | `/^[a-z0-9!@$&_.]{1,20}$/`                              | *(empty)* |

#### Response example

200 OK

Make the version 2 API able to retrieve data by those criteria.

```jsonc
{
  "data": {
    "account": {
      "address": "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
      "username": "genesis_56",
      "votesUsed": 10
    },
    "votes": [
      {
        "address": "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
        "amount": 1081560729258, // = voteWeight
        "username": "liskhq"
      }
    ]
  },
  "meta": {
    "count": 10,
    "offset": 0,
    "total": 10 // = votesUsed
  },
  "links": {}
}
```

400 Bad Request
```jsonc
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>"
}

```

404 Not Found
```jsonc
{
  "error": true,
  "message": "Account <account_id> not found."
}

```

#### Examples

```
https://service.lisk.com/api/v2/votes_sent?address=lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu
```

### Received votes

#### Endpoints

- `HTTP /api/v2/votes_received`
- `RPC get.votes_received`

#### Request parameters

| Parameter | Type   | Validation                                              | Default   | Comment                          |
| --------- | ------ | ------------------------------------------------------- | --------- | -------------------------------- |
| address   | String | `/^lsk[a-hjkm-z2-9]{38}$//^[1-9]\d{0,19}[L\|l]$/`       | *(empty)* | Resolves only new address system |
| publicKey | String | `/^([A-Fa-f0-9]{2}){32}$/`                              | *(empty)* |
| username  | String | `/^[a-z0-9!@$&_.]{1,20}$/`                              | *(empty)* |
| aggregate | Boolean |                                                        | false     |
| limit     | Number | `<1;100>`                                               | 10        |
| offset    | Number | `<0;+Inf>`                                              | 0         |

#### Response example

200 OK

Make the version 2 API able to retrieve data by those criteria.

```jsonc
{
  "data": {
    "account": {
      "address": "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
      "username": "genesis_56",
      "votesUsed": 10
    },
    "votes": [
      {
        "address": "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
        "amount": 1081560729258, // = voteWeight
        "username": "liskhq"
      }
    ]
  },
  "meta": {
    "count": 10,
    "offset": 0,
    "total": 10 // = votesUsed
  },
  "links": {}
}
```

400 Bad Request
```jsonc
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>"
}

```

404 Not Found
```jsonc
{
  "error": true,
  "message": "Account <account_id> not found."
}

```

#### Examples

```
https://service.lisk.com/api/v2/votes_received?address=lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu
```


### Round forgers

Retrieves next forgers with details in the current round.

_Supports pagination._

#### Endpoints

- HTTP `/api/v2/forgers`
- RPC `get.forgers`

#### Request parameters

| Parameter | Type   | Validation | Default | Comment |
| --------- | ------ | ---------- | ------- | ------- |
| limit     | Number | <1;103>    | 10      |
| offset    | Number | <0;+Inf>   | 0       |


#### Response example

200 OK

Make the version 2 API able to retrieve data by those criteria.

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
  "links": {}
}

```

400 Bad Request
```jsonc
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>"
}
```


#### Examples

Get 20 items, skip first 50

```
https://service.lisk.com/api/v2/forgers?limit=20&offset=50
```

## Blocks

### Block search

Retrieves block details based on criteria defined by params.

_Supports pagination._

#### Endpoints

- HTTP `/api/v2/blocks`
- RPC `get.blocks`

#### Request parameters

Make the version 2 API able to retrieve data by those criteria.

| Parameter          | Type             | Validation                                                        | Default     | Comment                                          |
| ------------------ | ---------------- | ----------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| blockId            | String           | `/^([1-9]\|[A-Fa-f0-9]){1,64}$/`                                  | *(empty)*   |
| height             | String           | `/[0-9]+/` and `/[0-9]+:[0-9]+/`                                  | *(empty)*   | Can be expressed as an interval ie. `1:20`       |
| generatorAddress   | String           | `/^lsk[a-hjkm-z2-9]{38}$/` and `/^[1-9]\d{0,19}[L\|l]$/`          | *(empty)*   | Resolves new and old address system              |
| generatorPublicKey | String           | `/^([A-Fa-f0-9]{2}){32}$/`                                        | *(empty)*   |
| generatorUsername  | String           | `/^[a-z0-9!@$&_.]{1,20}$/`                                        | *(empty)*   |
| timestamp          | String           | `/^[0-9]+$/` and `/^[0-9]+:[0-9]+$/`                              | *(empty)*   | Can be expressed as interval ie. `100000:200000` |
| limit              | Number           | `<1;100>`                                                         | 10          |
| offset             | Number           | `<0;+Inf>`                                                        | 0           |
| sort               | Array of Strings | `["height:asc", "height:desc","timestamp:asc", "timestamp:desc"]` | height:desc |

#### Response example

200 OK

```jsonc
{
  "data": [
    {
      "id": "1963e291eaa694fb41af320d7af4e92e38be26ddd88f61b150c74347f119de2e",
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
  "links": {}
}
```

400 Bad Request
```jsonc
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>"
}
```

404 Not Found
```jsonc
{
  "error": true,
  "message": "Block <block_id> not found."
}
```

#### Examples

Get blocks by block ID
```
https://service.lisk.com/api/v2/blocks?blockId=1963e291eaa694fb41af320d7af4e92e38be26ddd88f61b150c74347f119de2e
```

Get blocks by height
```
https://service.lisk.com/api/v2/blocks?height=9
```

## Transactions

### Transaction search

Retrieves network transactions by criteria defined by params.

_Supports pagination._

#### Endpoints

- HTTP `/api/v2/transactions`
- RPC `get.transactions`

#### Request parameters

| Parameter          | Type    | Validation                                                         | Default        | Comment                                                        |
| ------------------ | ------- | ------------------------------------------------------------------ | -------------- | -------------------------------------------------------------- |
| transactionId      | String  | `/^([1-9]\|[A-Fa-f0-9]){1,64}$/`                                   | *(empty)*      |
| moduleAssetId      | String  | `ModuleId:AssetId/[0-9]+:[0-9]+/`                                  | *(empty)*      | Transfer transaction: moduleID = 2,assetID = 0                 |
| moduleAssetName    | String  | `ModuleName:AssetName/[a-z]+:[a-z]+/`                              | *(empty)*      | Transfer transaction: moduleName = token, assetName = transfer |
| senderAddress      | String  | `/^lsk[a-hjkm-z2-9]{38}$//^[1-9]\d{0,19}[L\|l]$/`                  | *(empty)*      |
| senderPublicKey    | String  | `/^([A-Fa-f0-9]{2}){32}$/`                                         | *(empty)*      |
| senderUsername     | String  | `/^[a-z0-9!@$&_.]{1,20}$/`                                         | *(empty)*      |
| recipientAddress   | String  | `/^lsk[a-hjkm-z2-9]{38}$//^[1-9]\d{0,19}[L\|l]$/`                  | *(empty)*      |
| recipientPublicKey | String  | `/^([A-Fa-f0-9]{2}){32}$/`                                         | *(empty)*      |
| recipientUsername  | String  | `/^[a-z0-9!@$&_.]{1,20}$/`                                         | *(empty)*      |
| amount             | String  |                                                                    | *(empty)*      | Can be expressed as interval ie. `100000:200000`               |
| timestamp          | String  |                                                                    | *(empty)*      | Can be expressed as interval ie. `100000:200000`               |
| blockId             | String  | `/^([1-9]\|[A-Fa-f0-9]){1,64}$/`                                  | *(empty)*      | Block ID
| height             | String  |                                                                    | *(empty)*      | Block height
| search             | String  |                                                                    | *(empty)*      | Wildcard search
| data               | String  |                                                                    | *(empty)*      | Wildcard search                       |
| includePending     | Boolean |                                                                    | false          |
| nonce              | String  | `/^\d+$/`                                                          | *(empty)*      | In conjunction with senderAddress                              |
| limit              | Number  | `<1;100>`                                                          | 10             |
| offset             | Number  | `<0;+Inf>`                                                         | 0              |
| sort               | String  | `["amount:asc", "amount:desc", "timestamp:asc", "timestamp:desc"]` | timestamp:desc |



#### Response example

200 OK

Make the version 2 API able to retrieve data by those criteria.

```jsonc
{
  "data": [
    {
      "id": "222675625422353767",
      "operationId": "2:0",
      "operationName": "token:transfer",
      "fee": "1000000",
      "nonce": "0",
      "block": { // optional
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
      "asset": {     // Depends on operation
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
  "links": {}
}

```

400 Bad Request

```jsonc
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>"
}
```

404 Not Found

```jsonc
{
  "error": true,
  "message": "Transaction <transaction_id> not found."
}

```

#### Examples

Get transaction by transaction ID

```
https://service.lisk.com/api/v2/transactions?transactionId=222675625422353767
```

Get last 25 transactions for account `lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu`

```
https://service.lisk.com/api/v2/transactions?senderAddress=lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu
https://service.lisk.com/api/v2/transactions?recipientAddress=lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu
```

### Transaction broadcast

Sends encoded transaction to the network node.

#### Endpoints

- HTTP POST `/api/v2/transactions​`
- RPC `post.transactions`


#### Request parameters

No params required.

Payload:

```jsonc
{"transaction":"08021000180d2080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a32270880c2d72f12144fd8cc4e27a3489b57ed986efe3d327d3de40d921a0a73656e6420746f6b656e3a4069242925e0e377906364fe6c2eed67f419dfc1a757f73e848ff2f1ff97477f90263487d20aedf538edffe2ce5b3e7601a8528e5cd63845272e9d79c294a6590a"}
```

#### Response example

200 OK

```jsonc
{
  "message": "Transaction payload was successfully passed to the network node"
  "transactionId": "123456789"
}
```

400 Bad Request
```jsonc
{
  "error": true,
  "message": "Transaction payload was rejected by the network node"
}

```

500 Internal Server Error
```jsonc
{
  "error": true,
  "message": "Unable to reach the network node"
}

```

### Transaction statistics

Retrieves daily network transactions statistics for time spans defined by params.

_Supports pagination._

#### Endpoints

- HTTP `/api/v2/transactions​/statistics​/{interval}`
- RPC `get.transactions.statistics​`


#### Request parameters


| Parameter | Validation         | Default | Comment        |
| --------- | ------------------ | ------- | -------------- |
| interval  | `["day", "month"]` | (empty) | Required field |
| limit     | <1;100>            | 10      |
| offset    | <0;+Inf>           | 0       |



#### Response example

200 OK

```jsonc
  {
    "data": {
      "timeline": [
        {
          "timestamp": 1556100060,
          "date": "2019-11-27",
          "transactionCount": "14447177193385",
          "volume": "14447177193385"
        }
      ],
      "distributionByOperation": {},
      "distributionByAmount": {}
    },
    "meta": {
      "count": 100,
      "offset": 25,
      "total": 43749
    },
    "links": {}
  }

```

400 Bad Request
```jsonc
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>"
}

```

503 Service Unavailable
```jsonc
{
  "error": true,
  "message": "Service is not ready yet"
}

```

#### Examples

Get transaction statistics for the past 7 days.

```
https://service.lisk.com/api/v2/transactions​/statistics​/days&limit=7`
```

Get transaction statistics for the past 12 months.

```
https://service.lisk.com/api/v2/transactions​/statistics​/months&limit=12`
```

### Transaction schema

Retrieves transaction schema for certain transaction payloads.

#### Endpoints

- `HTTP /api/v2/transactions/schemas`
- `RPC get.transactions.schemas`

#### Request parameters


| Parameter       | Type   | Validation                             | Default   | Comment                                                        |
| --------------- | ------ | -------------------------------------- | --------- | -------------------------------------------------------------- |
| moduleAssetId   | String | `ModuleId:AssetId /[0-9]+:[0-9]+/`     | *(empty)* | Transfer transaction: moduleID = 2,assetID = 0                 |
| moduleAssetName | String | `ModuleName:AssetName /[a-z]+:[a-z]+/` | *(empty)* | Transfer transaction: moduleName = token, assetName = transfer |

#### Response example

200 OK

Make the version 2 API able to retrieve data by those criteria.

```jsonc
{
  "data": [
    {
      "moduleAssetId": "2:0",
      "moduleAssetName": "token:transfer",
      "schema": {
        ...
      }
    },
  ],
  "meta": {
    "count": 10,
    "offset": 0,
    "total": 10
  },
  "links": {}
}
```

400 Bad Request
```jsonc
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>"
}

```

404 Not Found
```jsonc
{
  "error": true,
  "message": "The entity <moduleAssetId/moduleAssetName> not found."
}

```

#### Examples

Get transaction schema for the transfer transaction type.

```
https://service.lisk.com/api/v2/transactions​/schemas?moduleAssetId=2:0`

https://service.lisk.com/api/v2/transactions​/schemas?moduleAssetName=token:transfer`
```

### Dynamic fees

Requests transaction fee estimates per byte.

#### Endpoints

- HTTP `/api/v2/fees`
- RPC `get.fees`


#### Request parameters

No params required.

#### Response example

200 OK


```jsonc
{
  "data": {
    "feeEstimatePerByte": {
      "low": 0,
      "medium": 1000,
      "high": 2000
    },
    "baseFeeById": {
      "2:0": "1000000000"
    },
    "baseFeeByName": {
      "token:transfer": "1000000000"
    },
    "minFeePerByte": 1000,
  },
  "meta": {
    "lastUpdate": 123456789,
    "lastBlockHeight": 25,
    "lastBlockId": 1354568
  },
  "links": {}
}
```

503 Service Unavailable
```jsonc
{
  "error": true,
  "message": "Service is not ready yet"
}
```

#### Examples

```
https://service.lisk.com/api/v2/fees
```


## Network

### Network peers

Retrieves network peers with details based on criteria.

_Supports pagination._

#### Endpoints

- HTTP `/api/v2/peers`
- RPC `get.peers`

#### Request parameters

| Parameter      | Type             | Validation                                                                                                                                                                      | Default       | Comment |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------- |
| ip             | String           | `/^(?:(?:25[0-5]\|2[0-4][0-9]\|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]\|2[0-4][0-9]\|[01]?[0-9][0-9]?)$/`                                                                             | *(empty)*     |
| networkVersion | String           | `/^(0\|[1-9]\d*)\.(0\|[1-9]\d*)\.(0\|[1-9]\d*)(-(0\|[1-9]\d*\|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0\|[1-9]\d*\|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/ ` | *(empty)*     |
| state          | Array of Strings | `["connected", "disconnected", "any"]`                                                                                                                                          | connected     |
| height         | Number           | ` <1;+Inf>`                                                                                                                                                                     | *(empty)*     |
| limit          | Number           | `<1;100>`                                                                                                                                                                       | 10            |
| offset         | Number           | `<0;+Inf>`                                                                                                                                                                      | 0             |
| sort           | String           | `["height:asc", "height:desc", "networkVersion:asc", "networkVersion:desc"]`                                                                                                    | "height:desc" |

#### Response example

200 OK
```jsonc
{
    "data": [
      {
        "ip": "127.0.0.1",
        "port": 4000,
        "networkVersion": "2.0",
        "state": "connected",
        "height": 8350681,
        "networkIdentifier": "258974416d58533227c6a3da1b6333f0541b06c65b41e45cf31926847a3db1ea",
        "location": {
          "countryCode": "DE",
          "countryName": "Germany",
          "hostname": "host.210.239.23.62.rev.coltfrance.com",
          "ip": "210.239.23.62",
        }
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

400 Bad Request
```
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>"
}
```

404 Not Found
```
{
  "error": true,
  "message": "There are no peers reported."
}
```

```
{
  "error": true,
  "message": "Peer with ip <ip> was not found."
}
```

#### Examples

Get hosts with certain IP

```
https://service.lisk.com/api/v2/peers?ip=210.239.23.62
```

### Network status

Retrieves network details and constants such as network height, fees, reward amount etc.

#### Endpoints

- HTTP `/api/v2/network/status`
- RPC `get.network.status`


#### Request parameters

No params required.

#### Response example

200 OK


```jsonc
{
  "data": {
    "genesisHeight": 16270293,
    "height": 16550779,
    "finalizedHeight": 16550609,
    "networkVersion": "3.0",
    "networkIdentifier": "4c09e6a781fc4c7bdb936ee815de8f94190f8a7519becd9de2081832be309a99",
    "milestone": "4",
    "currentReward": "100000000",
    "rewards": {
      "milestones": [ "500000000", "400000000", "300000000", "200000000", "100000000" ],
      "offset": 1451520,
      "distance": 3000000
    },
    "registeredModules": [ "token", "sequence", "keys", "dpos", "legacyAccount" ],
    "moduleAssets": [
      {
        "id": "2:0",
        "name": "token:transfer"
      },
      ...
    ],
    "blockTime": 10,
    "communityIdentifier": "Lisk",
    "minRemainingBalance": "5000000",
    "maxPayloadLength": 15360
  },
  "meta": {
    "lastUpdate": 1632471013,
    "lastBlockHeight": 16550779,
    "lastBlockId": "6266b07d18ef072896b79110a59fab4b0635796e870dba1783b21e296aaac36f"
  }
}
```

503 Service Unavailable
```jsonc
{
  "error": true,
  "message": "Service is not ready yet"
}

```

#### Examples

```
https://service.lisk.com/api/v2/network/status`
```

### Network statistics

Retrieves network statistics such as number of peers, node versions, heights etc.

#### Endpoints

- HTTP `/api/v2/network/statistics`
- RPC `get.network.statistics​`

#### Request parameters

No params required.

#### Response example

200 OK

```jsonc
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
      "networkVersion": {
        "2.0": 12,
        "2.1": 41
      }
    },
    "meta": {},
    "links": {}
  }
```

503 Service Unavailable
```jsonc
{
  "error": true,
  "message": "Service is not ready yet"
}
```

#### Examples

```
https://service.lisk.com/api/v2/network/statistics`
```

# Off-chain Features

## Market Prices

Retrieves current market prices.

#### Endpoints

- HTTP `/api/v2/market/prices`
- RPC `get.market.prices`

#### Request parameters

*(no params)*

#### Response example

200 OK
```jsonc
{
  "data": [
    {
      "code": "BTC_EUR",
      "from": "BTC",
      "rate": "53623.7800",
      "sources": [
          "binance"
      ],
      "to": "EUR",
      "updateTimestamp": 1634649300
    },
  ],
  "meta": {
      "count": 7
  }
}
```

503 Service Unavailable
```
{
  "error": true,
  "message": "Service is not ready yet"
}
```

## News Feed Aggregator

Retrieves recent blogposts from Lisk Blog and Twitter.

_Supports pagination._

#### Endpoints

- HTTP `/api/v2/newsfeed`
- RPC `get.newsfeed`

#### Request parameters

| Parameter      | Type             | Validation                                                                                                                                                                      | Default       | Comment |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------- |
| source         | String           | `/[A-z]+/`   | `*`     | Retrieves all sources by default |
| limit          | Number           | `<1;100>`                                                                                                                                                                       | 10            |
| offset         | Number           | `<0;+Inf>`                                                                                                                                                                      | 0             |

#### Response example

200 OK
```jsonc
{
  "data": [
    {
      "author": "Lisk",
      "content": "On Wednesday, March 3rd, Max Kordek, CEO and Co-founder at Lisk, hosted a live\nmonthly AMA (Ask Max Anything) on Lisk.chat. He answered questions regarding the\nupcoming milestones for Lisk, Lisk.js 2021, marketing plans for this year, and\nmuch more.\n\nThis blog post includes a recap of the live AMA session and features the\nquestions asked by community members, as well as Max’s answers.",
      "image_url": "https://lisk.com/sites/default/files/styles/blog_main_image_xl_retina/public/images/2021-04/montly-ama-ask-max-anything-recap-MAIN-V1%402x_0.png?itok=_0lipXxp",
      "imageUrl": "https://lisk.com/sites/default/files/styles/blog_main_image_xl_retina/public/images/2021-04/montly-ama-ask-max-anything-recap-MAIN-V1%402x_0.png?itok=_0lipXxp",
      "source": "drupal_lisk_general",
      "sourceId": "1001",
      "timestamp": 1614854580,
      "createdAt": 1614854580,
      "modifiedAt": 1614854580,
      "title": "AMA Recap: Ask Max Anything in March 2021",
      "url": "https://lisk.com/blog/events/ama-recap-ask-max-anything-march-2021"
    }
  ],
  "meta": {
    "count": 1,
    "limit": 1,
    "offset": 0
  }
}
```

400 Bad Request

_Invalid parameter_
```
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>"
}
```

_Invalid source name_
```
{
    "error": true,
    "message": "Invalid input: The 'source' field fails to match the required pattern."
}
```

503 Service Unavailable
```
{
  "error": true,
  "message": "Service is not ready yet"
}
```
## Account History Export

Returns transaction history export scheduling information

#### Endpoints

- HTTP `/api/v2/transactions/export`
- RPC `get.transactions.export`

#### Request parameters

| Parameter | Type             | Validation                                                 | Default        | Comment                                |
| --------- | ---------------- | ---------------------------------------------------------- | -------------- | -------------------------------------- |
| address   | String           | `/^lsk[a-hjkm-z2-9]{38}$//^[1-9]\d{0,19}[L\|l]$/`          | *(empty)*      |    |
| publicKey | String           | `/^([A-Fa-f0-9]{2}){32}$/`                                 | *(empty)*      |
| interval  | String           |                                                            | *(empty)*      |

#### Response example
Schedule transaction export

202 ACCEPTED
```jsonc
{
  "data": {
    "address": "lskdxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yt",
    "interval": "2021-03-16:2021-12-06",
  },
  "meta": {
    "ready": false
  }
}
```

File is ready to export

200 OK
```jsonc
{
  "data": {
    "address": "lskdxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yt",
    "interval": "2021-03-16:2021-12-06",
    "fileName": "transactions_lskdxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yt_2021-03-16_2021-12-06.csv",
    "fileUrl": "/api/v2/exports/transactions_lskdxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yt_2021-03-16_2021-12-06.csv"
  },
  "meta": {
    "ready": true
  }
}
```

400 Bad Request

_Invalid parameter_
```
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>"
}
```

404 Not Found
```jsonc
{
  "error": true,
  "message": "Account <account_id> not found."
}

```

File retrieval

#### Endpoints

- HTTP `/api/v2/exports/{filename}`
- RPC `Not Applicable`

#### Request parameters

| Parameter | Type             | Validation                                                 | Default        | Comment                                |
| --------- | ---------------- | ---------------------------------------------------------- | -------------- | -------------------------------------- |
| filename   | String          |                                                            | *(empty)*      |                                        |

#### Response example
Schedule transaction export

200 OK
```
[CSV file]
```

404 Not Found
```jsonc
{
  "error": true,
  "message": "File <filename.csv> not found."
}

```
