# Lisk Service API Documentation

Lisk Service is a middleware web application that interacts with the entire Lisk ecosystem in various aspects, such as accessing blockchain data (both on-chain and off-chain information), retrieving and storing market data, and exporting account history.

The main focus of this project is to provide data to Lisk blockchain users by serving them in a standardized JSON format and exposing a public RESTful API. The project is split into several smaller components (microservices) each focused on serving a single specific purpose.

As a pure backend project, it is designed to meet the requirements of front-end developers, especially Lisk Desktop and Lisk Mobile.

The API is accessible at `https://service.lisk.com`.
It is also possible to access the Testnet network at `https://testnet-service.lisk.com`.

The Lisk Service API is compatible with RESTful guidelines. The specification below contains numerous examples of how to use the API in practice.

## Table of Contents

- [Lisk Service API Documentation](#lisk-service-api-documentation)
  - [Endpoint logic](#endpoint-logic)
  - [Response format](#response-format)
  - [API Base URL](#api-base-url)
  - [API Status and Readiness](#api-status-and-readiness)
- [Lisk Blockchain-related Endpoints](#lisk-blockchain-related-endpoints)
  - [Blocks](#blocks)
    - [Block search](#block-search)
    - [Block Assets search](#block-assets-search)
  - [Transactions](#transactions)
    - [Transaction search](#transaction-search)
    - [Transaction Dryrun](#transaction-dryrun)
    - [Transaction Broadcast](#transaction-broadcast)
    - [Transaction Statistics](#transaction-statistics)
  - [Events](#events)
    - [Event search](#event-search)
  - [Generators](#generators)
    - [Generator list](#generator-list)
  - [Auth](#auth)
    - [Auth Account details](#auth-account-details)
  - [Validator](#validator)
    - [Validator details](#validator-details)
    - [Validate BLS Key](#validate-bls-key)
  - [Token](#token)
    - [Token Account Exists](#token-account-exists)
    - [Token Balances](#token-balances)
    - [Module Constants](#module-constants)
    - [Token Summary](#token-summary)
    - [Token Available IDs](#token-available-ids)
    - [Top Token Balances](#top-token-balances)
  - [Dynamic Fees](#dynamic-fees)
  - [Proof of Stake (PoS)](#proof-of-stake-pos)
    - [Claimable rewards](#claimable-rewards)
    - [Locked rewards](#locked-rewards)
    - [Module constants](#module-constants-1)
    - [Stakers (Received stakes)](#stakers-received-stakes)
    - [Stakes (Sent stakes)](#stakes-sent-stakes)
    - [Available unlocks](#available-unlocks)
    - [Validators](#validators)
  - [(Dynamic) Reward](#dynamic-reward)
    - [Module Constants](#module-constants-2)
    - [Default Reward](#default-reward)
    - [Annual Inflation](#annual-inflation)
  - [Legacy](#legacy)
    - [Legacy Account Details](#legacy-account-details)
  - [Network](#network)
    - [Network peers](#network-peers)
    - [Network status](#network-status)
    - [Network statistics](#network-statistics)
  - [Schemas](#schemas)
    - [List Known Schemas](#list-known-schemas)
  - [Interoperability](#interoperability)
    - [Interoperable applications](#interoperable-applications)
    - [Interoperable network statistics](#interoperable-network-statistics)
  - [Index Status](#index-status)
    - [Current indexing status](#current-indexing-status)
  - [Proxy](#proxy)
    - [Invoke Application Endpoints](#invoke-application-endpoints)
- [Off-chain Features](#off-chain-features)
  - [Application Metadata](#application-metadata)
    - [Application metadata overview](#application-metadata-overview)
    - [Application metadata details](#application-metadata-details)
    - [Application native token metadata details](#application-native-token-metadata-details)
    - [Application supported token metadata details](#application-supported-token-metadata-details)
  - [Market Prices](#market-prices)
  - [Account History Export](#account-history-export)

## Endpoint Logic

The logic of the endpoints is as follows:
The structure is always based on `/<root_entity or module>/<object>/<properties>`.

## Response format

All responses are in the JSON format - `application/json`.

Each API request has the following structure:

```jsonc
{
  "data": {}, // Contains the requested data
  "meta": {}, // Contains additional metadata, e.g. the values of `limit` and `offset`
}
```

The error responses adhere to the following structure:

```jsonc
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>", // Contains the error message
}
```

## API Base URL

The base URL for the Lisk Service v3 API is `/api/v3`. All the RESTful endpoints specified below follow the base URL.
<br/>*Example*: https://service.lisk.com/api/v3/spec

The WS-RPC endpoints however are available to query under the `/rpc-v3` namespace.
<br/>*Example*: https://service.lisk.com/api/rpc-v3

## API Status and Readiness

Lisk Service offers `/status` and `/ready` endpoints to check the current deployment and high-level service readiness statuses respectively. These endpoints must be queried without the API versioning.
<br/>*Example*: https://service.lisk.com/api/status, https://service.lisk.com/api/ready

# Lisk Blockchain-related Endpoints

## Blocks

### Block Search

Retrieves block details based on criteria defined by params.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/blocks`
- RPC `get.blocks`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| blockID | String | `/^([1-9]\|[A-Fa-f0-9]){1,64}$/` | *(empty)* |  |
| height | String | `/([0-9]+\|[0-9]+:[0-9]+)/` | *(empty)* | Can be expressed as an interval i.e. `1:20` or `1:` or `:20` |
| timestamp | String | `/([0-9]+\|[0-9]+:[0-9]+)/` | *(empty)* | Can be expressed as an interval i.e. `100000:200000` or `100000:` or `:200000` |
| generatorAddress | String | `/^lsk[a-hjkm-z2-9]{38}$/` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |
| sort | Enum | `["height:asc", "height:desc", "timestamp:asc", "timestamp:desc"]` | height:desc |  |

#### Response example

200 OK

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
    "count": 10,
    "offset": 10,
    "total": 400
  }
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

Get blocks by blockID
```
https://service.lisk.com/api/v3/blocks?blockID=01967dba384998026fe028119bd099ecf073c05c045381500a93d1a7c7307e5b
```

Get blocks by height
```
https://service.lisk.com/api/v3/blocks?height=9
```

### Block Assets Search

Retrieves block assets based on criteria defined by params.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/blocks/assets`
- RPC `get.blocks.assets`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| blockID | String | `/^([1-9]\|[A-Fa-f0-9]){1,64}$/` | *(empty)* |  |
| height | String | `/([0-9]+\|[0-9]+:[0-9]+)/` | *(empty)* | Can be expressed as an interval i.e. `1:20` or `1:` or `:20` |
| timestamp | String | `/([0-9]+\|[0-9]+:[0-9]+)/` | *(empty)* | Can be expressed as an interval i.e. `100000:200000` or `100000:` or `:200000` |
| module | String | `/^\b(?:[\w!@$&.]{1,32}\|,)+\b$/` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |
| sort | Enum | `["height:asc", "height:desc", "timestamp:asc", "timestamp:desc"]` | height:desc |  |

#### Response example

200 OK

```jsonc
{
  "data": [
    {
      "block": {
        "id": "f7b2066f73a71b1cbfd777e2c172a29f1b59017d3b0e6c22a11bec7318050bed",
        "height": 172124,
        "timestamp": 1679483460
      },
      "assets": [
        {
          "module": "random",
          "data": {
            "seedReveal": "3648ce33294fcf4a062bd2e2e90557d2"
          }
        }
      ]
    },
  ],
  "meta": {
    "count": 10,
    "offset": 0,
    "total": 172125
  }
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

Get block assets by block ID
```
https://service.lisk.com/api/v3/blocks/assets?blockID=f7b2066f73a71b1cbfd777e2c172a29f1b59017d3b0e6c22a11bec7318050bed
```

Get blocks by height
```
https://service.lisk.com/api/v3/block/assets?height=9
```

## Transactions

### Transaction search

Retrieves network transactions by criteria defined by parameters.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/transactions`
- RPC `get.transactions`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| transactionID | String | `/^\b([A-Fa-f0-9]){1,64}\b$/` | *(empty)* |  |
| moduleCommand | String | `/^[a-zA-Z][\w]{0,31}:[a-zA-Z][\w]{0,31}$/` | *(empty)* |  |
| senderAddress | String | `/^lsk[a-hjkm-z2-9]{38}$/` | *(empty)* |  |
| recipientAddress | String | `/^lsk[a-hjkm-z2-9]{38}$/` | *(empty)* |  |
| address | String | `/^lsk[a-hjkm-z2-9]{38}$/` | *(empty)* | Resolves for both senderAddress and recipientAddress |
| blockID | String | `/^([1-9]\|[A-Fa-f0-9]){1,64}$/` | *(empty)* |  |
| height | String | `/([0-9]+\|[0-9]+:[0-9]+)/` | *(empty)* | Can be expressed as an interval i.e. `1:20` or `1:` or `:20` |
| timestamp | String | `/([0-9]+\|[0-9]+:[0-9]+)/` | *(empty)* | Can be expressed as an interval i.e. `100000:200000` or `100000:` or `:200000` |
| executionStatus | String | `/^\b(?:pending\|success\|fail\|,)+\b$/` | *(empty)* | Can be expressed as a CSV |
| nonce | Number | `/^[0-9]+$/` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |
| sort | Enum | `["height:asc", "height:desc", "timestamp:asc", "timestamp:desc"]` | height:desc |  |
| order | Enum | `['index:asc', 'index:desc']` | index:asc | The order condition is applied after the sort condition, usually to break ties when the sort condition results in a collision. |

#### Response example

200 OK

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
    "total": 306
  }
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

Get transaction by transactionID

```
https://service.lisk.com/api/v3/transactions?transactionID=65c28137c130c6609a67fccfcd9d0f7c3df3577324f8d33134326d653ded613f
```

Get the last 25 transactions for account `lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu`

```
https://service.lisk.com/api/v3/transactions?address=lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu
```

### Transaction Dryrun

Sends decoded/encoded transactions to the network node.

#### Endpoints

- HTTP POST `/api/v3/transactions/dryrun​`
- RPC `post.transactions.dryrun`


#### Request parameters

No parameters are required.

Request payload:

```jsonc
{
  "skipDecode": false,
  "skipVerify": false,
  "transaction": {
    "module": "token",
    "command": "transfer",
    "fee": "100000000",
    "nonce": "0",
    "senderPublicKey": "a3f96c50d0446220ef2f98240898515cbba8155730679ca35326d98dcfb680f0",
    "signatures": [
      "48425002226745847e155cf5480478c2336a43bb178439e9058cc2b50e26335cf7c8360b6c6a49793d7ae8d087bc746cab9618655e6a0adba4694cce2015b50f"
    ],
    "params": {
      "recipientAddress": "lskz4upsnrwk75wmfurf6kbxsne2nkjqd3yzwdaup",
      "amount": "10000000000",
      "tokenID": "0000000000000000",
      "data": "Token transfer tx"
    }
  }
}
```

or

```jsonc
{
  "skipDecode": false,
  "skipVerify": false,
  "transaction": "0a040000000212040000000018002080c2d72f2a2044c3cb523c0a069e3f2dcb2d5994b6ba8ff9f73cac9ae746922aac4bc22f95b132310a0800000001000000001080c2d72f1a14632228a3e6a67ac6892de2eb4f60abe2e3bc42a1220a73656e6420746f6b656e3a40964d81e28727e6567b0fcd8a7fcf0a03f401cadbc1c16b9a7f300a52c372022b51a4553865199af34b5f73765f970704fc443d2a6dd510a26748905c306e530b"
}
```

#### Response example

200 OK

```jsonc
{
  "data": {
    "result": 1,
    "status": "ok",
    "events": [
      {
        "data": {
          "senderAddress": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
          "tokenID": "0000000000000000",
          "amount": "100003490",
          "recipientAddress": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99"
        },
        "index": 0,
        "module": "token",
        "name": "transferEvent",
        "topics": [
          "86afcdd640846bf41525481938653ee942be3fac1ecbcff08e98f9aeda3a9583",
          "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
          "0000000000000000",
          "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99"
        ],
        "height": 10
      }
    ]
  },
  "meta": {}
}
```

400 Bad Request
```jsonc
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>"
}
```

500 Internal Server Error
```jsonc
{
  "error": true,
  "message": "Unable to reach a network node."
}
```

### Transaction Broadcast

Sends encoded transactions to the network node.

#### Endpoints

- HTTP POST `/api/v3/transactions​`
- RPC `post.transactions`


#### Request parameters

No parameters are required.

Request payload:

```jsonc
{
  "transaction": "0a040000000212040000000018002080c2d72f2a2044c3cb523c0a069e3f2dcb2d5994b6ba8ff9f73cac9ae746922aac4bc22f95b132310a0800000001000000001080c2d72f1a14632228a3e6a67ac6892de2eb4f60abe2e3bc42a1220a73656e6420746f6b656e3a40964d81e28727e6567b0fcd8a7fcf0a03f401cadbc1c16b9a7f300a52c372022b51a4553865199af34b5f73765f970704fc443d2a6dd510a26748905c306e530b"
}
```

#### Response example

200 OK

```jsonc
{
  "message": "Transaction payload was successfully passed to the network node.",
  "transactionID": "bfd3521aeddd586f43931b6972b5771e9919e18f2cc91e940a15eacb588ecc6c"
}
```

400 Bad Request
```jsonc
{
  "error": true,
  "message": "Transaction payload was rejected by the network node."
}
```

500 Internal Server Error
```jsonc
{
  "error": true,
  "message": "Unable to reach the network node."
}
```

### Transaction Statistics

Retrieves daily network transaction statistics for periods defined by params.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/transactions​/statistics​`
- RPC `get.transactions.statistics​`


#### Request parameters


| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| interval | String | `["day", "month"]` | *(empty)* | Required |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |

#### Response example

200 OK

```jsonc
{
  "data": {
    "distributionByType": {
      "token:transfer": 1
    },
    "distributionByAmount": {
      "0000000000000000": {
        "1_10": 1
      }
    },
    "timeline": {
      "0000000000000000": [
        {
          "timestamp": 1556100060,
          "date": "2019-11-27",
          "transactionCount": 14447177193385,
          "volume": "14447177193385"
        }
      ]
    }
  },
  "meta": {
    "count": 10,
    "offset": 10,
    "total": 100,
    "duration": {
      "format": "YYYY-MM",
      "from": "2021-12",
      "to": "2022-09"
    }
  }
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
  "message": "Service is not ready yet."
}
```

#### Examples

Get transaction statistics for the past 7 days.

```
https://service.lisk.com/api/v3/transactions​/statistics​?interval=day&limit=7`
```

Get transaction statistics for the past 12 months.

```
https://service.lisk.com/api/v3/transactions​/statistics​?interval=month&limit=12`
```

## Events

### Event Search

Retrieves blockchain events based on criteria defined by params.

_Supports pagination._


#### Endpoints

- HTTP GET `/api/v3/events`
- RPC `get.events`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| transactionID | String | `/^\b([A-Fa-f0-9]){1,64}\b$/` | *(empty)* |  |
| senderAddress | String | `/^lsk[a-hjkm-z2-9]{38}$/` | *(empty)* |  |
| topic | String | `/^lsk[a-hjkm-z2-9]{38}$/` | *(empty)* | Can be expressed as a CSV |
| blockID | String | `/^([1-9]\|[A-Fa-f0-9]){1,64}$/` | *(empty)* |  |
| height | String | `/([0-9]+\|[0-9]+:[0-9]+)/` | *(empty)* | Can be expressed as an interval i.e. `1:20` or `1:` or `:20` |
| timestamp | String | `/([0-9]+\|[0-9]+:[0-9]+)/` | *(empty)* | Can be expressed as an interval i.e. `100000:200000` or `100000:` or `:200000` |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |
| sort | Enum | `["height:asc", "height:desc", "timestamp:asc", "timestamp:desc"]` | timestamp:desc |  |
| order | Enum | `['index:asc', 'index:desc']` | index:asc | The order condition is applied after the sort condition, usually to break ties when the sort condition results in a collision. |

#### Response example

200 OK

```jsonc
{
  "data": [
    {
      "id": "382b22c19980774b3c53504fd2e82995cec1354534051d50e48dd537db964a73",
      "module": "dynamicReward",
      "name": "rewardMinted",
      "data": {
        "amount": "100000000",
        "reduction": 0
      },
      "topics": [
        "03",
        "lsksod8bj35gmndy94yehxm25nybg5os6ycysejsm"
      ],
      "index": 0,
      "block": {
        "id": "01967dba384998026fe028119bd099ecf073c05c045381500a93d1a7c7307e5b",
        "height": 8350681,
        "timestamp": 1613323667
      }
    }
  ],
  "meta": {
    "count": 10,
    "offset": 10,
    "total": 400
  }
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

Get events by blockID
```
https://service.lisk.com/api/v3/events?blockID=01967dba384998026fe028119bd099ecf073c05c045381500a93d1a7c7307e5b
```

Get events by topic
```
https://service.lisk.com/api/v3/events?topic=lsksod8bj35gmndy94yehxm25nybg5os6ycysejsm
```


## Generators

### Generator list

Retrieves list of block generators.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/generators`
- RPC `get.generators`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| limit | Number | `[1,103]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |

#### Response example

200 OK

```jsonc
{
  "data": [
    {
      "address": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
      "name": "genesis_84",
      "publicKey": "b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd",
      "nextForgingTime": 1616058987,
      "status": "active"
    }
  ],
  "meta": {
    "count": 10,
    "offset": 10,
    "total": 103
  }
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

Get generators
```
https://service.lisk.com/api/v3/generators
```

## Auth

### Auth Account Details

Retrieves user-specific details from the Auth module.

#### Endpoints

- HTTP GET `/api/v3/auth`
- RPC `get.auth`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| address | String | `/^lsk[a-hjkm-z2-9]{38}$/` | *(empty)* | Required |
<!-- | publicKey | String | `/^([A-Fa-f0-9]{2}){32}$/;` | *(empty)* |  | -->
<!-- | name | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  | -->

#### Response example

200 OK

```jsonc
{
  "data": {
    "nonce": "1",
    "numberOfReqSignatures": 1,
    "mandatoryKeys": [
      "689b9a40aa11cbc8327d5eeebed9a1052940730f9c34cffb33ae591131141349"
    ],
    "optionalKeys": [
      "478842a844914f18a1c620a6494bf9931d0a862e96212bf5fc6f3ca18658febe"
    ]
  },
  "meta": {
    "address": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
    "publicKey": "b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd",
    "name": "genesis_84"
  }
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

Get auth details by address
```
https://service.lisk.com/api/v3/auth?address=lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99
```

## Validator

### Validator Details

Retrieves user-specific details from the Validator module.

#### Endpoints

- HTTP GET `/api/v3/validator`
- RPC `get.validator`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| address | String | `/^lsk[a-hjkm-z2-9]{38}$/` | *(empty)* | Required |
<!-- | publicKey | String | `/^([A-Fa-f0-9]{2}){32}$/;` | *(empty)* |  | -->
<!-- | name | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  | -->

#### Response example

200 OK

```jsonc
{
  "data": {
    "generatorKey": "4f3034d6704e8a38098083695822a3da",
    "blsKey": "3c95f7931d61909ff092375fc8ad2bc35e393b62d5cca902",
    "proofOfPossession": "96c5b026b1030eb73e5dfd9bfe78b0fb35e6bc7add5793fdca3d3e6a1dacb77390e998178b89f80ab8892212838bd5b2"
  },
  "meta": {
    "address": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
    "publicKey": "b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd",
    "name": "genesis_84"
  }
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

Get auth details by address
```
https://service.lisk.com/api/v3/validator?address=lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99
```

### Validate BLS Key

Validates a BLS key against its corresponding Proof of Possession.

_Supports pagination._

#### Endpoints

- HTTP POST `/api/v3/validator/validate-bls-key`
- RPC `post.validator.validate-bls-key`

#### Request parameters

No parameters are required.

#### Request payload:

```jsonc
{
  "blsKey": "b301803f8b5ac4a1133581fc676dfedc60d891dd5fa99028805e5ea5b08d3491af75d0707adab3b70c6a6a580217bf81",
  "proofOfPossession": "88bb31b27eae23038e14f9d9d1b628a39f5881b5278c3c6f0249f81ba0deb1f68aa5f8847854d6554051aa810fdf1cdb02df4af7a5647b1aa4afb60ec6d446ee17af24a8a50876ffdaf9bf475038ec5f8ebeda1c1c6a3220293e23b13a9a5d26"
}
```

#### Response example

200 OK

```jsonc
{
  "data": {
    "isValid": true
  },
  "meta": {}
}
```

400 Bad Request
```jsonc
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>"
}
```

## Token

### Token Account Exists

Validates if an entry exists in the Token sub-store for the specified address.

#### Endpoints

- HTTP GET `/api/v3/token/account/exists`
- RPC `get.token.account.exists`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| tokenID | String | `/^\b[a-fA-F0-9]{16}\b$/` | *(empty)* | Required |
| address | String | `/^lsk[a-hjkm-z2-9]{38}$/` | *(empty)* | One of address, publicKey or name required |
| publicKey | String | `/^([A-Fa-f0-9]{2}){32}$/;` | *(empty)* |  |
| name | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |

#### Response example

200 OK

```jsonc
{
  "data": {
    "isExists": true
  },
  "meta": {}
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

Get token account exists by address
```
https://service.lisk.com/api/v3/token/account/exists?tokenID=0400000000000000&address=lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99
```

### Token Balances

Retrieves the balances from the Token sub-store for the specified address.

#### Endpoints

- HTTP GET `/api/v3/token/balances`
- RPC `get.token.balances`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| address | String | `/^lsk[a-hjkm-z2-9]{38}$/` | *(empty)* | Required |
| tokenID | String | `/^\b[a-fA-F0-9]{16}\b$/` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |
<!-- | publicKey | String | `/^([A-Fa-f0-9]{2}){32}$/;` | *(empty)* |  | -->
<!-- | name | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  | -->

#### Response example

200 OK

```jsonc
{
  "data": {
    "tokenID": "0000000000000000",
    "availableBalance": "1000000000",
    "lockedBalances": [
      {
        "module": "token",
        "amount": "10000"
      }
    ]
  },
  "meta": {
    "address": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
    "count": 10,
    "offset": 10,
    "total": 100
  }
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

Get token balances by address
```
https://service.lisk.com/api/v3/token/balances?address=lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99
```

### Module Constants

Retrieves module constants from the Token module.

#### Endpoints

- HTTP GET `/api/v3/token/constants`
- RPC `get.token.constants`

#### Request parameters

No parameters are required.

#### Response example

200 OK

```jsonc
{
  "data": {
    "extraCommandFees": {
      "userAccountInitializationFee": "5000000",
      "escrowAccountInitializationFee": "5000000"
    }
  },
  "meta": {}
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

Get module constants from the Token module
```
https://service.lisk.com/api/v3/token/constants
```

### Token Summary

Retrieves the summary of the Token sub-store state from the Token module.

#### Endpoints

- HTTP GET `/api/v3/token/summary`
- RPC `get.token.summary`

#### Request parameters

No parameters are required.

#### Response example

200 OK

```jsonc
{
  "data": {
    "escrowedAmounts": [
      {
        "escrowChainID": "00000000",
        "tokenID": "0000000000000000",
        "amount": "50000000000"
      }
    ],
    "supportedTokens": [
      {
        "isSupportAllTokens": true,
        "patternTokenIDs": [
          "00000000******"
        ],
        "exactTokenIDs": [
          "0000000000000000"
        ]
      }
    ],
    "totalSupply": [
      {
        "tokenID": "0000000000000000",
        "amount": "50000000000"
      }
    ]
  },
  "meta": {}
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

Get module summary from the Token module
```
https://service.lisk.com/api/v3/token/summary
```

### Token Available IDs

Retrieves all the available token identifiers.

#### Endpoints

- HTTP GET `/api/v3/token/available-ids`
- RPC `get.token.available-ids`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |

#### Response example

200 OK

```jsonc
{
  "data": {
    "tokenIDs": [
      "0000000000000000"
    ]
  },
  "meta": {
    "count": 1,
    "offset": 0,
    "total": 1
  }
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

Get available token identifiers from the Token module
```
https://service.lisk.com/api/v3/token/available-ids
```

### Top Token Balances

Retrieves top token balances for a token ID.

#### Endpoints

- HTTP GET `/api/v3/token/balances/top`
- RPC `get.token.balances.top`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| tokenID | String | `/^\b[a-fA-F0-9]{16}\b$/` | *(empty)* | Required |
| sort | Enum | `["balance:desc", "balance:asc"]` | balance:desc |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |

#### Response example

200 OK

```jsonc
{
  "data": {
    "0400000000000000": [
      {
        "address": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
        "publicKey": "b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd",
        "name": "genesis_84",
        "balance": "10000000",
        "knowledge": {
          "owner": "Genesis Account",
          "description": "Initial supply",
        },
      },
    ],
  },
  "meta": {
    "count": 1,
    "offset": 0,
    "total": 1
  }
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

Get top token balances from the Token module
```
https://service.lisk.com/api/v3/token/balances/top
```

## Dynamic Fees

Requests transaction fee estimates per byte.

#### Endpoints

- HTTP GET `/api/v3/fees`
- RPC `get.fees`

#### Request parameters

No parameters are required.

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
    "feeTokenID": "0000000000000000",
    "minFeePerByte": 1000
  },
  "meta": {
    "lastUpdate": 1616008148,
    "lastBlockHeight": 25,
    "lastBlockID": "01967dba384998026fe028119bd099ecf073c05c045381500a93d1a7c7307e5b"
  }
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
  "message": "Service is not ready yet."
}
```

#### Examples

```
https://service.lisk.com/api/v3/fees
```


## Proof of Stake (PoS)

### Claimable rewards

Retrieves currently claimable rewards information from the PoS module for the specified address, publicKey or validator name.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/pos/rewards/claimable`
- RPC `get.pos.rewards.claimable`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| address   | String | `/^lsk[a-hjkm-z2-9]{38}$//^[1-9]\d{0,19}[L\|l]$/` | *(empty)* | One of address, publicKey or name required |
| publicKey | String | `/^([A-Fa-f0-9]{2}){32}$/` | *(empty)* |  |
| name | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |

#### Response example

200 OK

```jsonc
{
  "data": [
    {
      "tokenID": "0000000000000000",
      "reward": "109000000000"
    }
  ],
  "meta": {
    "count": 10,
    "offset": 10,
    "total": 400
  }
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

```
https://service.lisk.com/api/v3/pos/rewards/claimable?address=lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99
```

### Locked rewards

Retrieves currently locked rewards information from the PoS module for the specified address, publicKey or validator name.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/pos/rewards/locked`
- RPC `get.pos.rewards.locked`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| address   | String | `/^lsk[a-hjkm-z2-9]{38}$//^[1-9]\d{0,19}[L\|l]$/` | *(empty)* | One of address, publicKey or name required |
| publicKey | String | `/^([A-Fa-f0-9]{2}){32}$/` | *(empty)* |  |
| name | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |

#### Response example

200 OK

```jsonc
{
  "data": [
    {
      "tokenID": "0000000000000000",
      "reward": "109000000000"
    }
  ],
  "meta": {
    "count": 10,
    "offset": 10,
    "total": 400
  }
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

```
https://service.lisk.com/api/v3/pos/rewards/locked?address=lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99
```

### Module constants

Retrieves configurable constants information from the PoS module.

#### Endpoints

- HTTP GET `/api/v3/pos/constants`
- RPC `get.pos.constants`

#### Request parameters

No parameters are required.

#### Response example

200 OK
```jsonc
{
  "data": {
    "factorSelfStakes": 10,
    "maxLengthName": 20,
    "maxNumberSentStakes": 10,
    "maxNumberPendingUnlocks": 20,
    "failSafeMissedBlocks": 50,
    "failSafeInactiveWindow": 260000,
    "punishmentWindow": 780000,
    "roundLength": 10,
    "minWeightStandby": "100000000000",
    "numberActiveValidators": 101,
    "numberStandbyDelegates": 2,
    "posTokenID": "0000000000000000",
    "maxBFTWeightCap": 500,
    "commissionIncreasePeriod": 260000,
    "maxCommissionIncreaseRate": 500,
    "extraCommandFees": {
      "validatorRegistrationFee": "1000000000"
    }
  },
  "meta": {}
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

```
https://service.lisk.com/api/v3/pos/stakers
```

### Stakers (Received stakes)

Retrieves the list of stakers (received stakes) for the specified validator address, publicKey or name.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/pos/stakers`
- RPC `get.pos.stakers`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| address   | String | `/^lsk[a-hjkm-z2-9]{38}$//^[1-9]\d{0,19}[L\|l]$/` | *(empty)* | One of address, publicKey or name required |
| publicKey | String | `/^([A-Fa-f0-9]{2}){32}$/` | *(empty)* |  |
| name | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| search | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |

#### Response example

200 OK

```jsonc
{
  "data": {
    "stakers": [
      {
        "address": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
        "amount": "10815000000000",
        "name": "liskhq"
      }
    ]
  },
  "meta": {
    "validator": {
      "address": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
      "publicKey": "b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd",
      "name": "genesis_84"
    },
    "count": 100,
    "offset": 25,
    "total": 43749
  }
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

```
https://service.lisk.com/api/v3/pos/stakers?address=lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99
```

### Stakes (Sent stakes)

Retrieves the list of stakes sent by the specified user by their address, publicKey or validator name.

#### Endpoints

- HTTP GET `/api/v3/pos/stakes`
- RPC `get.pos.stakes`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| address   | String | `/^lsk[a-hjkm-z2-9]{38}$//^[1-9]\d{0,19}[L\|l]$/` | *(empty)* | One of address, publicKey or name required |
| publicKey | String | `/^([A-Fa-f0-9]{2}){32}$/` | *(empty)* |  |
| name | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| search | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |

#### Response example

200 OK

```jsonc
{
  "data": {
    "stakes": [
      {
        "address": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
        "amount": "10815000000000",
        "name": "liskhq"
      }
    ]
  },
  "meta": {
    "staker": {
      "address": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
      "publicKey": "b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd",
      "name": "genesis_84"
    },
    "count": 10
  }
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

```
https://service.lisk.com/api/v3/pos/stakes?address=lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99
```

### Available unlocks

Retrieves the list of available unlocks as a result of un-stakes for the specified user address, publicKey or validator name.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/pos/unlocks`
- RPC `get.pos.unlocks`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| address   | String | `/^lsk[a-hjkm-z2-9]{38}$//^[1-9]\d{0,19}[L\|l]$/` | *(empty)* | One of address, publicKey or name required |
| publicKey | String | `/^([A-Fa-f0-9]{2}){32}$/` | *(empty)* |  |
| name | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| isLocked | Boolean | `[true, false]` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |

#### Response example

200 OK

```jsonc
{
  "data": [
    {
      "address": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
      "publicKey": "b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd",
      "name": "genesis_84",
      "pendingUnlocks": [
        {
          "validatorAddress": "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
          "amount": "1000000000",
          "tokenID": "0000000000000000",
          "unstakeHeight": "10000",
          "expectedUnlockableHeight": "270000",
          "isLocked": true
        }
      ]
    }
  ],
  "meta": {
    "count": 10,
    "offset": 0,
    "total": 15
  }
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

```
https://service.lisk.com/api/v3/pos/unlocks?address=lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99
```

### Validators

Retrieves the list of validators.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/pos/validators`
- RPC `get.pos.validators`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| address   | String | `/^lsk[a-hjkm-z2-9]{38}$//^[1-9]\d{0,19}[L\|l]$/` | *(empty)* | One of address, publicKey or name required |
| publicKey | String | `/^([A-Fa-f0-9]{2}){32}$/` | *(empty)* |  |
| name | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| status | String | `/^\b(?:active\|standby\|banned\|punished\|ineligible\|,)+\b$/` | *(empty)* | Can be expressed as CSV |
| search | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |
| sort | Enum | `["commission:asc", "commission:desc", "validatorWeight:desc", "validatorWeight:asc", "rank:asc", "rank:desc", "name:asc", "name:desc"]` | commission:asc |  |

#### Response example

200 OK

```jsonc
{
  "data": [
    {
      "name": "genesis_84",
      "totalStake": "109000000000",
      "selfStake": "109000000000",
      "validatorWeight": "109000000000",
      "address": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
      "publicKey": "b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd",
      "lastGeneratedHeight": 0,
      "status": "active",
      "isBanned": false,
      "reportMisbehaviorHeights": [
        123
      ],
      "punishmentPeriods": [
        {
          "start": 123,
          "end": 260123
        }
      ],
      "consecutiveMissedBlocks": 0,
      "commission": 100000,
      "lastCommissionIncreaseHeight": 0,
      "sharingCoefficients": [
        {
          "tokenID": "0000000000000000",
          "coefficient": "0"
        }
      ],
      "rank": 93,
      "generatedBlocks": 1000,
      "totalCommission": "100000000000",
      "totalSelfStakeRewards": "0",
      "earnedRewards": "100000000000"
    }
  ],
  "meta": {
    "count": 10,
    "offset": 10,
    "total": 400
  }
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

```
https://service.lisk.com/api/v3/pos/validators?address=lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99
```

## (Dynamic) Reward

### Module Constants

Retrieves configurable constants information from the (Dynamic) Reward module.

#### Endpoints

- HTTP GET `/api/v3/reward/constants`
- RPC `get.reward.constants`

#### Request parameters

No parameters are required.

#### Response example

200 OK

```jsonc
{
  "data": {
    "rewardTokenID": "0000000000000000"
  },
  "meta": {}
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

```
https://service.lisk.com/api/v3/reward/constants
```

### Default Reward

Retrieves expected block reward at a specified height, as per the network configuration. The actual reward can vary and can be determined from the `rewardMinted` block event for the said height.

#### Endpoints

- HTTP GET `/api/v3/reward/default`
- RPC `get.reward.default`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| height | Number | `[0,Inf)` | *(empty)* |  |

#### Response example

200 OK

```jsonc
{
  "data": {
    "tokenID": "0000000000000000",
    "defaultReward": "109000000000"
  },
  "meta": {}
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

```
https://service.lisk.com/api/v3/reward/default?height=55000
```

### Annual Inflation

Retrieves the annual inflation at a specified height for the Reward token.

#### Endpoints

- HTTP GET `/api/v3/reward/annual-inflation`
- RPC `get.reward.annual-inflation`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| height | Number | `[0,Inf)` | *(empty)* |  |

#### Response example

200 OK

```jsonc
{
  "data": {
    "tokenID": "0000000000000000",
    "rate": "10.32"
  },
  "meta": {}
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

```
https://service.lisk.com/api/v3/reward/annual-inflation?height=500
```

## Legacy

### Legacy Account Details

Retrieves legacy account details for the specified user publicKey.

#### Endpoints

- HTTP `/api/v3/legacy`
- RPC `get.legacy`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| publicKey | String | `/^([A-Fa-f0-9]{2}){32}$/;` | *(empty)* |  |


#### Response example

200 OK
```jsonc
{
  "data": {
    "legacyAddress": "3057001998458191401L",
    "balance": "10000000"
  },
  "meta": {
    "address": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
    "publicKey": "b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd"
  }
}
```

400 Bad Request
```
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>"
}
```

#### Examples

Get legacy account details by publicKey

```
https://service.lisk.com/api/v3/legacy?publicKey=b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd
```

## Network

### Network peers

Retrieves network peers with details based on criteria.

_Supports pagination._

#### Endpoints

- HTTP `/api/v3/network/peers`
- RPC `get.network.peers`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| ip   | String | `/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/` | *(empty)* |  |
| networkVersion | String | `/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/` | *(empty)* |  |
| state | String | `["connected", "disconnected", "any"]` | any |  |
| height | Number | `[1,Inf)` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |
| sort | String | `["height:asc", "height:desc", "networkVersion:asc", "networkVersion:desc"]` | height:desc |  |

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

#### Examples

Get peer with IP

```
https://service.lisk.com/api/v3/network/peers?ip=210.239.23.62
```

### Network status

Retrieves network details and constants such as network height, fees, reward amount etc.

#### Endpoints

- HTTP `/api/v3/network/status`
- RPC `get.network.status`


#### Request parameters

No parameters are required.

#### Response example

200 OK

```jsonc
{
  "data": {
    "version": "4.0.0",
    "networkVersion": "3.0",
    "chainID": "00000000",
    "lastBlockID": "01967dba384998026fe028119bd099ecf073c05c045381500a93d1a7c7307e5b",
    "height": 16550779,
    "finalizedHeight": 16550609,
    "syncing": true,
    "unconfirmedTransactions": 0,
    "genesis": {
      "block": {
        "fromFile": "./config/genesis_block.blob"
      },
      "blockTime": 10,
      "chainID": "00000000",
      "minFeePerByte": 1000,
      "maxTransactionsSize": 15360,
      "bftBatchSize": 10
    },
    "registeredModules": [
      "token",
      "reward",
      "validators",
      "auth",
      "pos",
      "fee",
      "random",
      "legacy",
      "interoperability"
    ],
    "moduleCommands": [
      "auth:registerMultisignature",
      "interoperability:submitMainchainCrossChainUpdate",
      "interoperability:initializeMessageRecovery",
      "interoperability:recoverMessage",
      "interoperability:registerSidechain",
      "interoperability:recoverState",
      "interoperability:terminateSidechainForLiveness",
      "legacy:reclaimLSK",
      "legacy:registerKeys",
      "pos:registerValidator",
      "pos:reportMisbehavior",
      "pos:unlock",
      "pos:updateGeneratorKey",
      "pos:stake",
      "pos:changeCommission",
      "pos:claimRewards",
      "token:transfer",
      "token:transferCrossChain"
    ],
    "network": {
      "version": "1.0",
      "port": 10,
      "seedPeers": [
        {
          "ip": "127.0.0.1",
          "port": 7667
        }
      ],
      "blacklistedIPs": 15360,
      "fixedPeers": 10,
      "whitelistedPeers": "string"
    }
  },
  "meta": {
    "lastUpdate": "1632471013",
    "lastBlockHeight": 16550779,
    "lastBlockID": "6266b07d18ef072896b79110a59fab4b0635796e870dba1783b21e296aaac36f"
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
https://service.lisk.com/api/v3/network/status`
```

### Network statistics

Retrieves network statistics such as the number of peers, node versions, heights etc.

#### Endpoints

- HTTP `/api/v3/network/statistics`
- RPC `get.network.statistics​`

#### Request parameters

No parameters are required.

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
https://service.lisk.com/api/v3/network/statistics`
```

## Schemas

### List Known Schemas

Retrieves all available schemas.

#### Endpoints

- HTTP GET `/api/v3/schemas`
- RPC `get.schemas`

#### Request parameters

No parameters are required.

#### Response example

200 OK

```jsonc
{
    "data": {
        "block": {
            "schema": {
                "$id": "/block",
                "type": "object",
                "properties": {
                    "header": {
                        "dataType": "bytes",
                        "fieldNumber": 1
                    },
                    "transactions": {
                        "type": "array",
                        "items": {
                            "dataType": "bytes"
                        },
                        "fieldNumber": 2
                    },
                    "assets": {
                        "type": "array",
                        "items": {
                            "dataType": "bytes"
                        },
                        "fieldNumber": 3
                    }
                },
                "required": [
                    "header",
                    "transactions",
                    "assets"
                ]
            }
        },
        "header": {
            "schema": {
                "$id": "/block/header/3",
                "type": "object",
                "properties": {
                    "version": {
                        "dataType": "uint32",
                        "fieldNumber": 1
                    },
                    "timestamp": {
                        "dataType": "uint32",
                        "fieldNumber": 2
                    },
                    "height": {
                        "dataType": "uint32",
                        "fieldNumber": 3
                    },
                    "previousBlockID": {
                        "dataType": "bytes",
                        "fieldNumber": 4
                    },
                    "generatorAddress": {
                        "dataType": "bytes",
                        "fieldNumber": 5,
                        "format": "lisk32"
                    },
                    "transactionRoot": {
                        "dataType": "bytes",
                        "fieldNumber": 6
                    },
                    "assetRoot": {
                        "dataType": "bytes",
                        "fieldNumber": 7
                    },
                    "eventRoot": {
                        "dataType": "bytes",
                        "fieldNumber": 8
                    },
                    "stateRoot": {
                        "dataType": "bytes",
                        "fieldNumber": 9
                    },
                    "maxHeightPrevoted": {
                        "dataType": "uint32",
                        "fieldNumber": 10
                    },
                    "maxHeightGenerated": {
                        "dataType": "uint32",
                        "fieldNumber": 11
                    },
                    "impliesMaxPrevotes": {
                        "dataType": "boolean",
                        "fieldNumber": 12
                    },
                    "validatorsHash": {
                        "dataType": "bytes",
                        "fieldNumber": 13
                    },
                    "aggregateCommit": {
                        "type": "object",
                        "fieldNumber": 14,
                        "required": [
                            "height",
                            "aggregationBits",
                            "certificateSignature"
                        ],
                        "properties": {
                            "height": {
                                "dataType": "uint32",
                                "fieldNumber": 1
                            },
                            "aggregationBits": {
                                "dataType": "bytes",
                                "fieldNumber": 2
                            },
                            "certificateSignature": {
                                "dataType": "bytes",
                                "fieldNumber": 3
                            }
                        }
                    },
                    "signature": {
                        "dataType": "bytes",
                        "fieldNumber": 15
                    }
                },
                "required": [
                    "version",
                    "timestamp",
                    "height",
                    "previousBlockID",
                    "generatorAddress",
                    "transactionRoot",
                    "assetRoot",
                    "eventRoot",
                    "stateRoot",
                    "maxHeightPrevoted",
                    "maxHeightGenerated",
                    "impliesMaxPrevotes",
                    "validatorsHash",
                    "aggregateCommit",
                    "signature"
                ]
            }
        },
        "asset": {
            "schema": {
                "$id": "/block/asset/3",
                "type": "object",
                "required": [
                    "module",
                    "data"
                ],
                "properties": {
                    "module": {
                        "dataType": "string",
                        "fieldNumber": 1
                    },
                    "data": {
                        "dataType": "bytes",
                        "fieldNumber": 2
                    }
                }
            }
        },
        "transaction": {
            "schema": {
                "$id": "/lisk/transaction",
                "type": "object",
                "required": [
                    "module",
                    "command",
                    "nonce",
                    "fee",
                    "senderPublicKey",
                    "params"
                ],
                "properties": {
                    "module": {
                        "dataType": "string",
                        "fieldNumber": 1,
                        "minLength": 1,
                        "maxLength": 32
                    },
                    "command": {
                        "dataType": "string",
                        "fieldNumber": 2,
                        "minLength": 1,
                        "maxLength": 32
                    },
                    "nonce": {
                        "dataType": "uint64",
                        "fieldNumber": 3
                    },
                    "fee": {
                        "dataType": "uint64",
                        "fieldNumber": 4
                    },
                    "senderPublicKey": {
                        "dataType": "bytes",
                        "fieldNumber": 5,
                        "minLength": 32,
                        "maxLength": 32
                    },
                    "params": {
                        "dataType": "bytes",
                        "fieldNumber": 6
                    },
                    "signatures": {
                        "type": "array",
                        "items": {
                            "dataType": "bytes"
                        },
                        "fieldNumber": 7
                    }
                }
            }
        },
        "event": {
            "schema": {
                "$id": "/block/event",
                "type": "object",
                "required": [
                    "module",
                    "name",
                    "data",
                    "topics",
                    "height",
                    "index"
                ],
                "properties": {
                    "module": {
                        "dataType": "string",
                        "minLength": 1,
                        "maxLength": 32,
                        "fieldNumber": 1
                    },
                    "name": {
                        "dataType": "string",
                        "minLength": 1,
                        "maxLength": 32,
                        "fieldNumber": 2
                    },
                    "data": {
                        "dataType": "bytes",
                        "fieldNumber": 3
                    },
                    "topics": {
                        "type": "array",
                        "fieldNumber": 4,
                        "items": {
                            "dataType": "bytes"
                        }
                    },
                    "height": {
                        "dataType": "uint32",
                        "fieldNumber": 5
                    },
                    "index": {
                        "dataType": "uint32",
                        "fieldNumber": 6
                    }
                }
            }
        },
        "standardEvent": {
            "schema": {
                "$id": "/block/event/standard",
                "type": "object",
                "required": [
                    "success"
                ],
                "properties": {
                    "success": {
                        "dataType": "boolean",
                        "fieldNumber": 1
                    }
                }
            }
        },
        "ccm": {
            "schema": {
                "$id": "/modules/interoperability/ccm",
                "type": "object",
                "required": [
                    "module",
                    "crossChainCommand",
                    "nonce",
                    "fee",
                    "sendingChainID",
                    "receivingChainID",
                    "params",
                    "status"
                ],
                "properties": {
                    "module": {
                        "dataType": "string",
                        "minLength": 1,
                        "maxLength": 32,
                        "fieldNumber": 1
                    },
                    "crossChainCommand": {
                        "dataType": "string",
                        "minLength": 1,
                        "maxLength": 32,
                        "fieldNumber": 2
                    },
                    "nonce": {
                        "dataType": "uint64",
                        "fieldNumber": 3
                    },
                    "fee": {
                        "dataType": "uint64",
                        "fieldNumber": 4
                    },
                    "sendingChainID": {
                        "dataType": "bytes",
                        "minLength": 4,
                        "maxLength": 4,
                        "fieldNumber": 5
                    },
                    "receivingChainID": {
                        "dataType": "bytes",
                        "minLength": 4,
                        "maxLength": 4,
                        "fieldNumber": 6
                    },
                    "params": {
                        "dataType": "bytes",
                        "fieldNumber": 7
                    },
                    "status": {
                        "dataType": "uint32",
                        "fieldNumber": 8
                    }
                }
            }
        },
        "events": [
            {
                "module": "auth",
                "name": "multisignatureRegistration",
                "schema": {
                    "$id": "/auth/events/multisigRegData",
                    "type": "object",
                    "required": [
                        "numberOfSignatures",
                        "mandatoryKeys",
                        "optionalKeys"
                    ],
                    "properties": {
                        "numberOfSignatures": {
                            "dataType": "uint32",
                            "fieldNumber": 1
                        },
                        "mandatoryKeys": {
                            "type": "array",
                            "items": {
                                "dataType": "bytes",
                                "minLength": 32,
                                "maxLength": 32
                            },
                            "fieldNumber": 2
                        },
                        "optionalKeys": {
                            "type": "array",
                            "items": {
                                "dataType": "bytes",
                                "minLength": 32,
                                "maxLength": 32
                            },
                            "fieldNumber": 3
                        }
                    }
                }
            },
            {
                "module": "auth",
                "name": "invalidSignature",
                "schema": {
                    "$id": "/auth/events/invalidSigData",
                    "type": "object",
                    "required": [
                        "numberOfSignatures",
                        "mandatoryKeys",
                        "optionalKeys",
                        "failingPublicKey",
                        "failingSignature"
                    ],
                    "properties": {
                        "numberOfSignatures": {
                            "dataType": "uint32",
                            "fieldNumber": 1
                        },
                        "mandatoryKeys": {
                            "type": "array",
                            "items": {
                                "dataType": "bytes",
                                "minLength": 32,
                                "maxLength": 32
                            },
                            "fieldNumber": 2
                        },
                        "optionalKeys": {
                            "type": "array",
                            "items": {
                                "dataType": "bytes",
                                "minLength": 32,
                                "maxLength": 32
                            },
                            "fieldNumber": 3
                        },
                        "failingPublicKey": {
                            "dataType": "bytes",
                            "minLength": 32,
                            "maxLength": 32,
                            "fieldNumber": 4
                        },
                        "failingSignature": {
                            "dataType": "bytes",
                            "minLength": 64,
                            "maxLength": 64,
                            "fieldNumber": 5
                        }
                    }
                }
            },
            {
                "module": "dynamicReward",
                "name": "rewardMinted",
                "schema": {
                    "$id": "/reward/events/rewardMintedData",
                    "type": "object",
                    "required": [
                        "amount",
                        "reduction"
                    ],
                    "properties": {
                        "amount": {
                            "dataType": "uint64",
                            "fieldNumber": 1
                        },
                        "reduction": {
                            "dataType": "uint32",
                            "fieldNumber": 2
                        }
                    }
                }
            },
            {
                "module": "fee",
                "name": "generatorFeeProcessed",
                "schema": {
                    "$id": "/fee/events/generatorFeeProcessed",
                    "type": "object",
                    "required": [
                        "senderAddress",
                        "generatorAddress",
                        "burntAmount",
                        "generatorAmount"
                    ],
                    "properties": {
                        "senderAddress": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 1
                        },
                        "generatorAddress": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 2
                        },
                        "burntAmount": {
                            "dataType": "uint64",
                            "fieldNumber": 3
                        },
                        "generatorAmount": {
                            "dataType": "uint64",
                            "fieldNumber": 4
                        }
                    }
                }
            },
            {
                "module": "fee",
                "name": "relayerFeeProcessed",
                "schema": {
                    "$id": "/fee/events/relayerFeeProcessed",
                    "type": "object",
                    "required": [
                        "ccmID",
                        "relayerAddress",
                        "burntAmount",
                        "relayerAmount"
                    ],
                    "properties": {
                        "ccmID": {
                            "dataType": "bytes",
                            "minLength": 32,
                            "maxLength": 32,
                            "fieldNumber": 1
                        },
                        "relayerAddress": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 2
                        },
                        "burntAmount": {
                            "dataType": "uint64",
                            "fieldNumber": 3
                        },
                        "relayerAmount": {
                            "dataType": "uint64",
                            "fieldNumber": 4
                        }
                    }
                }
            },
            {
                "module": "fee",
                "name": "insufficientFee",
                "schema": {
                    "$id": "/lisk/empty",
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "module": "interoperability",
                "name": "chainAccountUpdated",
                "schema": {
                    "$id": "/modules/interoperability/chainData",
                    "type": "object",
                    "required": [
                        "name",
                        "lastCertificate",
                        "status"
                    ],
                    "properties": {
                        "name": {
                            "dataType": "string",
                            "fieldNumber": 1
                        },
                        "lastCertificate": {
                            "type": "object",
                            "fieldNumber": 2,
                            "required": [
                                "height",
                                "timestamp",
                                "stateRoot",
                                "validatorsHash"
                            ],
                            "properties": {
                                "height": {
                                    "dataType": "uint32",
                                    "fieldNumber": 1
                                },
                                "timestamp": {
                                    "dataType": "uint32",
                                    "fieldNumber": 2
                                },
                                "stateRoot": {
                                    "dataType": "bytes",
                                    "minLength": 32,
                                    "maxLength": 32,
                                    "fieldNumber": 3
                                },
                                "validatorsHash": {
                                    "dataType": "bytes",
                                    "minLength": 32,
                                    "maxLength": 32,
                                    "fieldNumber": 4
                                }
                            }
                        },
                        "status": {
                            "dataType": "uint32",
                            "fieldNumber": 3
                        }
                    }
                }
            },
            {
                "module": "interoperability",
                "name": "ccmProcessed",
                "schema": {
                    "$id": "/interoperability/events/ccmProcessed",
                    "type": "object",
                    "required": [
                        "ccm",
                        "result",
                        "code"
                    ],
                    "properties": {
                        "ccm": {
                            "fieldNumber": 1,
                            "type": "object",
                            "required": [
                                "module",
                                "crossChainCommand",
                                "nonce",
                                "fee",
                                "sendingChainID",
                                "receivingChainID",
                                "params",
                                "status"
                            ],
                            "properties": {
                                "module": {
                                    "dataType": "string",
                                    "minLength": 1,
                                    "maxLength": 32,
                                    "fieldNumber": 1
                                },
                                "crossChainCommand": {
                                    "dataType": "string",
                                    "minLength": 1,
                                    "maxLength": 32,
                                    "fieldNumber": 2
                                },
                                "nonce": {
                                    "dataType": "uint64",
                                    "fieldNumber": 3
                                },
                                "fee": {
                                    "dataType": "uint64",
                                    "fieldNumber": 4
                                },
                                "sendingChainID": {
                                    "dataType": "bytes",
                                    "minLength": 4,
                                    "maxLength": 4,
                                    "fieldNumber": 5
                                },
                                "receivingChainID": {
                                    "dataType": "bytes",
                                    "minLength": 4,
                                    "maxLength": 4,
                                    "fieldNumber": 6
                                },
                                "params": {
                                    "dataType": "bytes",
                                    "fieldNumber": 7
                                },
                                "status": {
                                    "dataType": "uint32",
                                    "fieldNumber": 8
                                }
                            }
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 2
                        },
                        "code": {
                            "dataType": "uint32",
                            "fieldNumber": 3
                        }
                    }
                }
            },
            {
                "module": "interoperability",
                "name": "ccmSendSuccess",
                "schema": {
                    "$id": "/interoperability/events/ccmSendSuccess",
                    "type": "object",
                    "required": [
                        "ccm"
                    ],
                    "properties": {
                        "ccm": {
                            "fieldNumber": 1,
                            "type": "object",
                            "required": [
                                "module",
                                "crossChainCommand",
                                "nonce",
                                "fee",
                                "sendingChainID",
                                "receivingChainID",
                                "params",
                                "status"
                            ],
                            "properties": {
                                "module": {
                                    "dataType": "string",
                                    "minLength": 1,
                                    "maxLength": 32,
                                    "fieldNumber": 1
                                },
                                "crossChainCommand": {
                                    "dataType": "string",
                                    "minLength": 1,
                                    "maxLength": 32,
                                    "fieldNumber": 2
                                },
                                "nonce": {
                                    "dataType": "uint64",
                                    "fieldNumber": 3
                                },
                                "fee": {
                                    "dataType": "uint64",
                                    "fieldNumber": 4
                                },
                                "sendingChainID": {
                                    "dataType": "bytes",
                                    "minLength": 4,
                                    "maxLength": 4,
                                    "fieldNumber": 5
                                },
                                "receivingChainID": {
                                    "dataType": "bytes",
                                    "minLength": 4,
                                    "maxLength": 4,
                                    "fieldNumber": 6
                                },
                                "params": {
                                    "dataType": "bytes",
                                    "fieldNumber": 7
                                },
                                "status": {
                                    "dataType": "uint32",
                                    "fieldNumber": 8
                                }
                            }
                        }
                    }
                }
            },
            {
                "module": "interoperability",
                "name": "ccmSentFailed",
                "schema": {
                    "$id": "/interoperability/events/ccmSendFail",
                    "type": "object",
                    "required": [
                        "ccm",
                        "code"
                    ],
                    "properties": {
                        "ccm": {
                            "$id": "/modules/interoperability/ccm",
                            "type": "object",
                            "required": [
                                "module",
                                "crossChainCommand",
                                "nonce",
                                "fee",
                                "sendingChainID",
                                "receivingChainID",
                                "params",
                                "status"
                            ],
                            "properties": {
                                "module": {
                                    "dataType": "string",
                                    "minLength": 1,
                                    "maxLength": 32,
                                    "fieldNumber": 1
                                },
                                "crossChainCommand": {
                                    "dataType": "string",
                                    "minLength": 1,
                                    "maxLength": 32,
                                    "fieldNumber": 2
                                },
                                "nonce": {
                                    "dataType": "uint64",
                                    "fieldNumber": 3
                                },
                                "fee": {
                                    "dataType": "uint64",
                                    "fieldNumber": 4
                                },
                                "sendingChainID": {
                                    "dataType": "bytes",
                                    "minLength": 4,
                                    "maxLength": 4,
                                    "fieldNumber": 5
                                },
                                "receivingChainID": {
                                    "dataType": "bytes",
                                    "minLength": 4,
                                    "maxLength": 4,
                                    "fieldNumber": 6
                                },
                                "params": {
                                    "dataType": "bytes",
                                    "fieldNumber": 7
                                },
                                "status": {
                                    "dataType": "uint32",
                                    "fieldNumber": 8
                                }
                            },
                            "fieldNumber": 1
                        },
                        "code": {
                            "dataType": "uint32",
                            "fieldNumber": 2
                        }
                    }
                }
            },
            {
                "module": "interoperability",
                "name": "invalidRegistrationSignature",
                "schema": {
                    "$id": "/lisk/empty",
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "module": "interoperability",
                "name": "terminatedStateCreated",
                "schema": {
                    "$id": "/modules/interoperability/terminatedState",
                    "type": "object",
                    "required": [
                        "stateRoot",
                        "mainchainStateRoot",
                        "initialized"
                    ],
                    "properties": {
                        "stateRoot": {
                            "dataType": "bytes",
                            "minLength": 32,
                            "maxLength": 32,
                            "fieldNumber": 1
                        },
                        "mainchainStateRoot": {
                            "dataType": "bytes",
                            "minLength": 32,
                            "maxLength": 32,
                            "fieldNumber": 2
                        },
                        "initialized": {
                            "dataType": "boolean",
                            "fieldNumber": 3
                        }
                    }
                }
            },
            {
                "module": "interoperability",
                "name": "terminatedOutboxCreated",
                "schema": {
                    "$id": "/modules/interoperability/terminatedOutbox",
                    "type": "object",
                    "required": [
                        "outboxRoot",
                        "outboxSize",
                        "partnerChainInboxSize"
                    ],
                    "properties": {
                        "outboxRoot": {
                            "dataType": "bytes",
                            "minLength": 32,
                            "maxLength": 32,
                            "fieldNumber": 1
                        },
                        "outboxSize": {
                            "dataType": "uint32",
                            "fieldNumber": 2
                        },
                        "partnerChainInboxSize": {
                            "dataType": "uint32",
                            "fieldNumber": 3
                        }
                    }
                }
            },
            {
                "module": "interoperability",
                "name": "invalidCertificateSignature",
                "schema": {
                    "$id": "/lisk/empty",
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "module": "legacy",
                "name": "accountReclaimed",
                "schema": {
                    "$id": "lisk/legacy/accountReclaimedEventData",
                    "type": "object",
                    "required": [
                        "legacyAddress",
                        "address",
                        "amount"
                    ],
                    "properties": {
                        "legacyAddress": {
                            "dataType": "bytes",
                            "maxLength": 8,
                            "fieldNumber": 1
                        },
                        "address": {
                            "dataType": "bytes",
                            "maxLength": 20,
                            "fieldNumber": 2
                        },
                        "amount": {
                            "dataType": "uint64",
                            "fieldNumber": 3
                        }
                    }
                }
            },
            {
                "module": "legacy",
                "name": "keysRegistered",
                "schema": {
                    "$id": "lisk/legacy/keysRegisteredEventData",
                    "type": "object",
                    "required": [
                        "address",
                        "generatorKey",
                        "blsKey"
                    ],
                    "properties": {
                        "address": {
                            "dataType": "bytes",
                            "maxLength": 20,
                            "fieldNumber": 1
                        },
                        "generatorKey": {
                            "dataType": "bytes",
                            "maxLength": 32,
                            "fieldNumber": 2
                        },
                        "blsKey": {
                            "dataType": "bytes",
                            "maxLength": 48,
                            "fieldNumber": 3
                        }
                    }
                }
            },
            {
                "module": "pos",
                "name": "validatorBanned",
                "schema": {
                    "$id": "/pos/events/validatorBannedData",
                    "type": "object",
                    "required": [
                        "address",
                        "height"
                    ],
                    "properties": {
                        "address": {
                            "dataType": "bytes",
                            "fieldNumber": 1,
                            "format": "lisk32"
                        },
                        "height": {
                            "dataType": "uint32",
                            "fieldNumber": 2
                        }
                    }
                }
            },
            {
                "module": "pos",
                "name": "validatorPunished",
                "schema": {
                    "$id": "/pos/events/punishValidatorData",
                    "type": "object",
                    "required": [
                        "address",
                        "height"
                    ],
                    "properties": {
                        "address": {
                            "dataType": "bytes",
                            "fieldNumber": 1,
                            "format": "lisk32"
                        },
                        "height": {
                            "dataType": "uint32",
                            "fieldNumber": 2
                        }
                    }
                }
            },
            {
                "module": "pos",
                "name": "validatorRegistered",
                "schema": {
                    "$id": "/pos/events/registerValidatorData",
                    "type": "object",
                    "required": [
                        "address",
                        "name"
                    ],
                    "properties": {
                        "address": {
                            "dataType": "bytes",
                            "fieldNumber": 1,
                            "format": "lisk32"
                        },
                        "name": {
                            "dataType": "string",
                            "fieldNumber": 2
                        }
                    }
                }
            },
            {
                "module": "pos",
                "name": "validatorStaked",
                "schema": {
                    "$id": "/pos/events/validatorStakedData",
                    "type": "object",
                    "required": [
                        "senderAddress",
                        "validatorAddress",
                        "amount",
                        "result"
                    ],
                    "properties": {
                        "senderAddress": {
                            "dataType": "bytes",
                            "fieldNumber": 1,
                            "format": "lisk32"
                        },
                        "validatorAddress": {
                            "dataType": "bytes",
                            "fieldNumber": 2,
                            "format": "lisk32"
                        },
                        "amount": {
                            "dataType": "sint64",
                            "fieldNumber": 3
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 4
                        }
                    }
                }
            },
            {
                "module": "pos",
                "name": "commissionChange",
                "schema": {
                    "$id": "/pos/events/commissionChangeData",
                    "type": "object",
                    "required": [
                        "validatorAddress",
                        "oldCommission",
                        "newCommission"
                    ],
                    "properties": {
                        "validatorAddress": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 1
                        },
                        "oldCommission": {
                            "dataType": "uint32",
                            "fieldNumber": 2
                        },
                        "newCommission": {
                            "dataType": "uint32",
                            "fieldNumber": 3
                        }
                    }
                }
            },
            {
                "module": "pos",
                "name": "rewardsAssigned",
                "schema": {
                    "$id": "/pos/events/rewardsAssignedData",
                    "type": "object",
                    "required": [
                        "stakerAddress",
                        "validatorAddress",
                        "tokenID",
                        "amount"
                    ],
                    "properties": {
                        "stakerAddress": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 1
                        },
                        "validatorAddress": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 2
                        },
                        "tokenID": {
                            "dataType": "bytes",
                            "minLength": 8,
                            "maxLength": 8,
                            "fieldNumber": 3
                        },
                        "amount": {
                            "dataType": "uint64",
                            "fieldNumber": 4
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "transfer",
                "schema": {
                    "$id": "/token/events/transfer",
                    "type": "object",
                    "required": [
                        "senderAddress",
                        "recipientAddress",
                        "tokenID",
                        "amount",
                        "result"
                    ],
                    "properties": {
                        "senderAddress": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 1
                        },
                        "recipientAddress": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 2
                        },
                        "tokenID": {
                            "dataType": "bytes",
                            "minLength": 8,
                            "maxLength": 8,
                            "fieldNumber": 3
                        },
                        "amount": {
                            "dataType": "uint64",
                            "fieldNumber": 4
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 5
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "transferCrossChain",
                "schema": {
                    "$id": "/token/events/transferCrossChain",
                    "type": "object",
                    "required": [
                        "senderAddress",
                        "recipientAddress",
                        "tokenID",
                        "amount",
                        "receivingChainID",
                        "result"
                    ],
                    "properties": {
                        "senderAddress": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 1
                        },
                        "recipientAddress": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 2
                        },
                        "tokenID": {
                            "dataType": "bytes",
                            "minLength": 8,
                            "maxLength": 8,
                            "fieldNumber": 3
                        },
                        "amount": {
                            "dataType": "uint64",
                            "fieldNumber": 4
                        },
                        "receivingChainID": {
                            "dataType": "bytes",
                            "minLength": 4,
                            "maxLength": 4,
                            "fieldNumber": 5
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 6
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "ccmTransfer",
                "schema": {
                    "$id": "/token/events/ccmTransfer",
                    "type": "object",
                    "required": [
                        "senderAddress",
                        "recipientAddress",
                        "tokenID",
                        "amount",
                        "receivingChainID",
                        "result"
                    ],
                    "properties": {
                        "senderAddress": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 1
                        },
                        "recipientAddress": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 2
                        },
                        "tokenID": {
                            "dataType": "bytes",
                            "minLength": 8,
                            "maxLength": 8,
                            "fieldNumber": 3
                        },
                        "amount": {
                            "dataType": "uint64",
                            "fieldNumber": 4
                        },
                        "receivingChainID": {
                            "dataType": "bytes",
                            "minLength": 4,
                            "maxLength": 4,
                            "fieldNumber": 5
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 6
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "mint",
                "schema": {
                    "$id": "/token/events/mint",
                    "type": "object",
                    "required": [
                        "address",
                        "tokenID",
                        "amount",
                        "result"
                    ],
                    "properties": {
                        "address": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 1
                        },
                        "tokenID": {
                            "dataType": "bytes",
                            "minLength": 8,
                            "maxLength": 8,
                            "fieldNumber": 2
                        },
                        "amount": {
                            "dataType": "uint64",
                            "fieldNumber": 3
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 4
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "burn",
                "schema": {
                    "$id": "/token/events/burn",
                    "type": "object",
                    "required": [
                        "address",
                        "tokenID",
                        "amount",
                        "result"
                    ],
                    "properties": {
                        "address": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 1
                        },
                        "tokenID": {
                            "dataType": "bytes",
                            "minLength": 8,
                            "maxLength": 8,
                            "fieldNumber": 2
                        },
                        "amount": {
                            "dataType": "uint64",
                            "fieldNumber": 3
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 4
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "lock",
                "schema": {
                    "$id": "/token/events/lock",
                    "type": "object",
                    "required": [
                        "address",
                        "module",
                        "tokenID",
                        "amount",
                        "result"
                    ],
                    "properties": {
                        "address": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 1
                        },
                        "module": {
                            "dataType": "string",
                            "minLength": 1,
                            "maxLength": 32,
                            "fieldNumber": 2
                        },
                        "tokenID": {
                            "dataType": "bytes",
                            "minLength": 8,
                            "maxLength": 8,
                            "fieldNumber": 3
                        },
                        "amount": {
                            "dataType": "uint64",
                            "fieldNumber": 4
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 5
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "unlock",
                "schema": {
                    "$id": "/token/events/unlock",
                    "type": "object",
                    "required": [
                        "address",
                        "module",
                        "tokenID",
                        "amount",
                        "result"
                    ],
                    "properties": {
                        "address": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 1
                        },
                        "module": {
                            "dataType": "string",
                            "minLength": 1,
                            "maxLength": 32,
                            "fieldNumber": 2
                        },
                        "tokenID": {
                            "dataType": "bytes",
                            "minLength": 8,
                            "maxLength": 8,
                            "fieldNumber": 3
                        },
                        "amount": {
                            "dataType": "uint64",
                            "fieldNumber": 4
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 5
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "initializeToken",
                "schema": {
                    "$id": "/token/events/initializeTokenEvent",
                    "type": "object",
                    "required": [
                        "tokenID",
                        "result"
                    ],
                    "properties": {
                        "tokenID": {
                            "dataType": "bytes",
                            "minLength": 8,
                            "maxLength": 8,
                            "fieldNumber": 1
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 2
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "initializeUserAccount",
                "schema": {
                    "$id": "/token/events/initializeUserAccount",
                    "type": "object",
                    "required": [
                        "address",
                        "tokenID",
                        "initializationFee",
                        "result"
                    ],
                    "properties": {
                        "address": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 1
                        },
                        "tokenID": {
                            "dataType": "bytes",
                            "minLength": 8,
                            "maxLength": 8,
                            "fieldNumber": 2
                        },
                        "initializationFee": {
                            "dataType": "uint64",
                            "fieldNumber": 3
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 4
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "initializeEscrowAccount",
                "schema": {
                    "$id": "/token/events/initializeEscrowAccount",
                    "type": "object",
                    "required": [
                        "chainID",
                        "tokenID",
                        "initializationFee",
                        "result"
                    ],
                    "properties": {
                        "chainID": {
                            "dataType": "bytes",
                            "minLength": 4,
                            "maxLength": 4,
                            "fieldNumber": 1
                        },
                        "tokenID": {
                            "dataType": "bytes",
                            "minLength": 8,
                            "maxLength": 8,
                            "fieldNumber": 2
                        },
                        "initializationFee": {
                            "dataType": "uint64",
                            "fieldNumber": 3
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 4
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "recover",
                "schema": {
                    "$id": "/token/events/recover",
                    "type": "object",
                    "required": [
                        "terminatedChainID",
                        "tokenID",
                        "amount",
                        "result"
                    ],
                    "properties": {
                        "terminatedChainID": {
                            "dataType": "bytes",
                            "minLength": 4,
                            "maxLength": 4,
                            "fieldNumber": 1
                        },
                        "tokenID": {
                            "dataType": "bytes",
                            "minLength": 8,
                            "maxLength": 8,
                            "fieldNumber": 2
                        },
                        "amount": {
                            "dataType": "uint64",
                            "fieldNumber": 3
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 4
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "beforeCCCExecution",
                "schema": {
                    "$id": "/token/events/beforeCCCExecution",
                    "type": "object",
                    "required": [
                        "ccmID",
                        "messageFeeTokenID",
                        "relayerAddress",
                        "result"
                    ],
                    "properties": {
                        "ccmID": {
                            "dataType": "bytes",
                            "minLength": 32,
                            "maxLength": 32,
                            "fieldNumber": 1
                        },
                        "messageFeeTokenID": {
                            "dataType": "bytes",
                            "minLength": 8,
                            "maxLength": 8,
                            "fieldNumber": 2
                        },
                        "relayerAddress": {
                            "dataType": "bytes",
                            "format": "lisk32",
                            "fieldNumber": 3
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 4
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "beforeCCMForwarding",
                "schema": {
                    "$id": "/token/events/beforeCCMForwarding",
                    "type": "object",
                    "required": [
                        "ccmID",
                        "messageFeeTokenID",
                        "result"
                    ],
                    "properties": {
                        "ccmID": {
                            "dataType": "bytes",
                            "minLength": 32,
                            "maxLength": 32,
                            "fieldNumber": 1
                        },
                        "messageFeeTokenID": {
                            "dataType": "bytes",
                            "minLength": 8,
                            "maxLength": 8,
                            "fieldNumber": 2
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 3
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "allTokensSupported",
                "schema": {
                    "$id": "/lisk/empty",
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "module": "token",
                "name": "allTokensSupportRemoved",
                "schema": {
                    "$id": "/lisk/empty",
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "module": "token",
                "name": "allTokensFromChainSupported",
                "schema": {
                    "$id": "/token/events/allTokensFromChainSupported",
                    "type": "object",
                    "required": [
                        "chainID"
                    ],
                    "properties": {
                        "chainID": {
                            "dataType": "bytes",
                            "minLength": 4,
                            "maxLength": 4,
                            "fieldNumber": 1
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "allTokensFromChainSupportRemoved",
                "schema": {
                    "$id": "/token/events/allTokensFromChainSupportRemoved",
                    "type": "object",
                    "required": [
                        "chainID"
                    ],
                    "properties": {
                        "chainID": {
                            "dataType": "bytes",
                            "minLength": 4,
                            "maxLength": 4,
                            "fieldNumber": 1
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "tokenIDSupported",
                "schema": {
                    "$id": "/token/events/tokenIDSupported",
                    "type": "object",
                    "required": [
                        "tokenID"
                    ],
                    "properties": {
                        "tokenID": {
                            "dataType": "bytes",
                            "minLength": 8,
                            "maxLength": 8,
                            "fieldNumber": 1
                        }
                    }
                }
            },
            {
                "module": "token",
                "name": "tokenIDSupportRemoved",
                "schema": {
                    "$id": "/token/events/tokenIDSupportRemoved",
                    "type": "object",
                    "required": [
                        "tokenID"
                    ],
                    "properties": {
                        "tokenID": {
                            "dataType": "bytes",
                            "minLength": 8,
                            "maxLength": 8,
                            "fieldNumber": 1
                        }
                    }
                }
            },
            {
                "module": "validators",
                "name": "generatorKeyRegistration",
                "schema": {
                    "$id": "/validators/event/generatorKeyRegData",
                    "type": "object",
                    "required": [
                        "generatorKey",
                        "result"
                    ],
                    "properties": {
                        "generatorKey": {
                            "dataType": "bytes",
                            "minLength": 32,
                            "maxLength": 32,
                            "fieldNumber": 1
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 2
                        }
                    }
                }
            },
            {
                "module": "validators",
                "name": "blsKeyRegistration",
                "schema": {
                    "$id": "/validators/event/blsKeyRegData",
                    "type": "object",
                    "required": [
                        "blsKey",
                        "result"
                    ],
                    "properties": {
                        "blsKey": {
                            "dataType": "bytes",
                            "minLength": 48,
                            "maxLength": 48,
                            "fieldNumber": 1
                        },
                        "proofOfPossession": {
                            "dataType": "bytes",
                            "minLength": 96,
                            "maxLength": 96,
                            "fieldNumber": 2
                        },
                        "result": {
                            "dataType": "uint32",
                            "fieldNumber": 3
                        }
                    }
                }
            }
        ],
        "assets": [
            {
                "module": "auth",
                "version": "0",
                "schema": {
                    "$id": "/auth/module/genesis",
                    "type": "object",
                    "required": [
                        "authDataSubstore"
                    ],
                    "properties": {
                        "authDataSubstore": {
                            "type": "array",
                            "fieldNumber": 1,
                            "items": {
                                "type": "object",
                                "required": [
                                    "storeKey",
                                    "storeValue"
                                ],
                                "properties": {
                                    "storeKey": {
                                        "dataType": "bytes",
                                        "fieldNumber": 1
                                    },
                                    "storeValue": {
                                        "type": "object",
                                        "fieldNumber": 2,
                                        "required": [
                                            "nonce",
                                            "numberOfSignatures",
                                            "mandatoryKeys",
                                            "optionalKeys"
                                        ],
                                        "properties": {
                                            "nonce": {
                                                "dataType": "uint64",
                                                "fieldNumber": 1
                                            },
                                            "numberOfSignatures": {
                                                "dataType": "uint32",
                                                "fieldNumber": 2
                                            },
                                            "mandatoryKeys": {
                                                "type": "array",
                                                "fieldNumber": 3,
                                                "items": {
                                                    "dataType": "bytes"
                                                }
                                            },
                                            "optionalKeys": {
                                                "type": "array",
                                                "fieldNumber": 4,
                                                "items": {
                                                    "dataType": "bytes"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                "module": "interoperability",
                "version": "0",
                "schema": {
                    "$id": "/interoperability/module/genesis",
                    "type": "object",
                    "required": [
                        "ownChainName",
                        "ownChainNonce",
                        "chainInfos",
                        "terminatedStateAccounts",
                        "terminatedOutboxAccounts"
                    ],
                    "properties": {
                        "ownChainName": {
                            "dataType": "string",
                            "maxLength": 32,
                            "fieldNumber": 1
                        },
                        "ownChainNonce": {
                            "dataType": "uint64",
                            "fieldNumber": 2
                        },
                        "chainInfos": {
                            "type": "array",
                            "fieldNumber": 3,
                            "items": {
                                "type": "object",
                                "required": [
                                    "chainID",
                                    "chainData",
                                    "channelData",
                                    "chainValidators"
                                ],
                                "properties": {
                                    "chainID": {
                                        "dataType": "bytes",
                                        "minLength": 4,
                                        "maxLength": 4,
                                        "fieldNumber": 1
                                    },
                                    "chainData": {
                                        "$id": "/modules/interoperability/chainData",
                                        "type": "object",
                                        "required": [
                                            "name",
                                            "lastCertificate",
                                            "status"
                                        ],
                                        "properties": {
                                            "name": {
                                                "dataType": "string",
                                                "fieldNumber": 1
                                            },
                                            "lastCertificate": {
                                                "type": "object",
                                                "fieldNumber": 2,
                                                "required": [
                                                    "height",
                                                    "timestamp",
                                                    "stateRoot",
                                                    "validatorsHash"
                                                ],
                                                "properties": {
                                                    "height": {
                                                        "dataType": "uint32",
                                                        "fieldNumber": 1
                                                    },
                                                    "timestamp": {
                                                        "dataType": "uint32",
                                                        "fieldNumber": 2
                                                    },
                                                    "stateRoot": {
                                                        "dataType": "bytes",
                                                        "minLength": 32,
                                                        "maxLength": 32,
                                                        "fieldNumber": 3
                                                    },
                                                    "validatorsHash": {
                                                        "dataType": "bytes",
                                                        "minLength": 32,
                                                        "maxLength": 32,
                                                        "fieldNumber": 4
                                                    }
                                                }
                                            },
                                            "status": {
                                                "dataType": "uint32",
                                                "fieldNumber": 3
                                            }
                                        },
                                        "fieldNumber": 2
                                    },
                                    "channelData": {
                                        "$id": "/modules/interoperability/channel",
                                        "type": "object",
                                        "required": [
                                            "inbox",
                                            "outbox",
                                            "partnerChainOutboxRoot",
                                            "messageFeeTokenID",
                                            "minReturnFeePerByte"
                                        ],
                                        "properties": {
                                            "inbox": {
                                                "type": "object",
                                                "fieldNumber": 1,
                                                "required": [
                                                    "appendPath",
                                                    "size",
                                                    "root"
                                                ],
                                                "properties": {
                                                    "appendPath": {
                                                        "type": "array",
                                                        "items": {
                                                            "dataType": "bytes",
                                                            "minLength": 32,
                                                            "maxLength": 32
                                                        },
                                                        "fieldNumber": 1
                                                    },
                                                    "size": {
                                                        "dataType": "uint32",
                                                        "fieldNumber": 2
                                                    },
                                                    "root": {
                                                        "dataType": "bytes",
                                                        "minLength": 32,
                                                        "maxLength": 32,
                                                        "fieldNumber": 3
                                                    }
                                                }
                                            },
                                            "outbox": {
                                                "type": "object",
                                                "fieldNumber": 2,
                                                "required": [
                                                    "appendPath",
                                                    "size",
                                                    "root"
                                                ],
                                                "properties": {
                                                    "appendPath": {
                                                        "type": "array",
                                                        "items": {
                                                            "dataType": "bytes",
                                                            "minLength": 32,
                                                            "maxLength": 32
                                                        },
                                                        "fieldNumber": 1
                                                    },
                                                    "size": {
                                                        "dataType": "uint32",
                                                        "fieldNumber": 2
                                                    },
                                                    "root": {
                                                        "dataType": "bytes",
                                                        "minLength": 32,
                                                        "maxLength": 32,
                                                        "fieldNumber": 3
                                                    }
                                                }
                                            },
                                            "partnerChainOutboxRoot": {
                                                "dataType": "bytes",
                                                "minLength": 32,
                                                "maxLength": 32,
                                                "fieldNumber": 3
                                            },
                                            "messageFeeTokenID": {
                                                "dataType": "bytes",
                                                "minLength": 8,
                                                "maxLength": 8,
                                                "fieldNumber": 4
                                            },
                                            "minReturnFeePerByte": {
                                                "dataType": "uint64",
                                                "fieldNumber": 5
                                            }
                                        },
                                        "fieldNumber": 3
                                    },
                                    "chainValidators": {
                                        "$id": "/modules/interoperability/chainValidators",
                                        "type": "object",
                                        "required": [
                                            "activeValidators",
                                            "certificateThreshold"
                                        ],
                                        "properties": {
                                            "activeValidators": {
                                                "type": "array",
                                                "fieldNumber": 1,
                                                "minItems": 1,
                                                "maxItems": 199,
                                                "items": {
                                                    "type": "object",
                                                    "required": [
                                                        "blsKey",
                                                        "bftWeight"
                                                    ],
                                                    "properties": {
                                                        "blsKey": {
                                                            "dataType": "bytes",
                                                            "minLength": 48,
                                                            "maxLength": 48,
                                                            "fieldNumber": 1
                                                        },
                                                        "bftWeight": {
                                                            "dataType": "uint64",
                                                            "fieldNumber": 2
                                                        }
                                                    }
                                                }
                                            },
                                            "certificateThreshold": {
                                                "dataType": "uint64",
                                                "fieldNumber": 2
                                            }
                                        },
                                        "fieldNumber": 4
                                    }
                                }
                            }
                        },
                        "terminatedStateAccounts": {
                            "type": "array",
                            "fieldNumber": 4,
                            "items": {
                                "type": "object",
                                "required": [
                                    "chainID",
                                    "terminatedStateAccount"
                                ],
                                "properties": {
                                    "chainID": {
                                        "dataType": "bytes",
                                        "minLength": 4,
                                        "maxLength": 4,
                                        "fieldNumber": 1
                                    },
                                    "terminatedStateAccount": {
                                        "$id": "/modules/interoperability/terminatedState",
                                        "type": "object",
                                        "required": [
                                            "stateRoot",
                                            "mainchainStateRoot",
                                            "initialized"
                                        ],
                                        "properties": {
                                            "stateRoot": {
                                                "dataType": "bytes",
                                                "minLength": 32,
                                                "maxLength": 32,
                                                "fieldNumber": 1
                                            },
                                            "mainchainStateRoot": {
                                                "dataType": "bytes",
                                                "minLength": 32,
                                                "maxLength": 32,
                                                "fieldNumber": 2
                                            },
                                            "initialized": {
                                                "dataType": "boolean",
                                                "fieldNumber": 3
                                            }
                                        },
                                        "fieldNumber": 2
                                    }
                                }
                            }
                        },
                        "terminatedOutboxAccounts": {
                            "type": "array",
                            "fieldNumber": 5,
                            "items": {
                                "type": "object",
                                "required": [
                                    "chainID",
                                    "terminatedOutboxAccount"
                                ],
                                "properties": {
                                    "chainID": {
                                        "dataType": "bytes",
                                        "minLength": 4,
                                        "maxLength": 4,
                                        "fieldNumber": 1
                                    },
                                    "terminatedOutboxAccount": {
                                        "$id": "/modules/interoperability/terminatedOutbox",
                                        "type": "object",
                                        "required": [
                                            "outboxRoot",
                                            "outboxSize",
                                            "partnerChainInboxSize"
                                        ],
                                        "properties": {
                                            "outboxRoot": {
                                                "dataType": "bytes",
                                                "minLength": 32,
                                                "maxLength": 32,
                                                "fieldNumber": 1
                                            },
                                            "outboxSize": {
                                                "dataType": "uint32",
                                                "fieldNumber": 2
                                            },
                                            "partnerChainInboxSize": {
                                                "dataType": "uint32",
                                                "fieldNumber": 3
                                            }
                                        },
                                        "fieldNumber": 2
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                "module": "legacy",
                "version": "0",
                "schema": {
                    "$id": "/legacy/module/genesis",
                    "type": "object",
                    "required": [
                        "accounts"
                    ],
                    "properties": {
                        "accounts": {
                            "type": "array",
                            "fieldNumber": 1,
                            "items": {
                                "type": "object",
                                "required": [
                                    "address",
                                    "balance"
                                ],
                                "properties": {
                                    "address": {
                                        "dataType": "bytes",
                                        "minLength": 8,
                                        "maxLength": 8,
                                        "fieldNumber": 1
                                    },
                                    "balance": {
                                        "dataType": "uint64",
                                        "fieldNumber": 2
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                "module": "pos",
                "version": "0",
                "schema": {
                    "$id": "/pos/module/genesis",
                    "type": "object",
                    "required": [
                        "validators",
                        "stakers",
                        "genesisData"
                    ],
                    "properties": {
                        "validators": {
                            "type": "array",
                            "fieldNumber": 1,
                            "items": {
                                "type": "object",
                                "required": [
                                    "address",
                                    "name",
                                    "blsKey",
                                    "proofOfPossession",
                                    "generatorKey",
                                    "lastGeneratedHeight",
                                    "isBanned",
                                    "reportMisbehaviorHeights",
                                    "consecutiveMissedBlocks",
                                    "commission",
                                    "lastCommissionIncreaseHeight",
                                    "sharingCoefficients"
                                ],
                                "properties": {
                                    "address": {
                                        "dataType": "bytes",
                                        "format": "lisk32",
                                        "fieldNumber": 1
                                    },
                                    "name": {
                                        "dataType": "string",
                                        "fieldNumber": 2,
                                        "minLength": 1,
                                        "maxLength": 20
                                    },
                                    "blsKey": {
                                        "dataType": "bytes",
                                        "fieldNumber": 3,
                                        "minLength": 48,
                                        "maxLength": 48
                                    },
                                    "proofOfPossession": {
                                        "dataType": "bytes",
                                        "fieldNumber": 4,
                                        "minLength": 96,
                                        "maxLength": 96
                                    },
                                    "generatorKey": {
                                        "dataType": "bytes",
                                        "fieldNumber": 5,
                                        "minLength": 32,
                                        "maxLength": 32
                                    },
                                    "lastGeneratedHeight": {
                                        "dataType": "uint32",
                                        "fieldNumber": 6
                                    },
                                    "isBanned": {
                                        "dataType": "boolean",
                                        "fieldNumber": 7
                                    },
                                    "reportMisbehaviorHeights": {
                                        "type": "array",
                                        "fieldNumber": 8,
                                        "items": {
                                            "dataType": "uint32"
                                        }
                                    },
                                    "consecutiveMissedBlocks": {
                                        "dataType": "uint32",
                                        "fieldNumber": 9
                                    },
                                    "commission": {
                                        "dataType": "uint32",
                                        "fieldNumber": 10,
                                        "maximum": 10000
                                    },
                                    "lastCommissionIncreaseHeight": {
                                        "dataType": "uint32",
                                        "fieldNumber": 11
                                    },
                                    "sharingCoefficients": {
                                        "type": "array",
                                        "fieldNumber": 12,
                                        "items": {
                                            "type": "object",
                                            "required": [
                                                "tokenID",
                                                "coefficient"
                                            ],
                                            "properties": {
                                                "tokenID": {
                                                    "dataType": "bytes",
                                                    "minLength": 8,
                                                    "maxLength": 8,
                                                    "fieldNumber": 1
                                                },
                                                "coefficient": {
                                                    "dataType": "bytes",
                                                    "maxLength": 24,
                                                    "fieldNumber": 2
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "stakers": {
                            "type": "array",
                            "fieldNumber": 2,
                            "items": {
                                "type": "object",
                                "required": [
                                    "address",
                                    "stakes",
                                    "pendingUnlocks"
                                ],
                                "properties": {
                                    "address": {
                                        "dataType": "bytes",
                                        "format": "lisk32",
                                        "fieldNumber": 1
                                    },
                                    "stakes": {
                                        "type": "array",
                                        "fieldNumber": 2,
                                        "items": {
                                            "type": "object",
                                            "required": [
                                                "validatorAddress",
                                                "amount",
                                                "sharingCoefficients"
                                            ],
                                            "properties": {
                                                "validatorAddress": {
                                                    "dataType": "bytes",
                                                    "format": "lisk32",
                                                    "fieldNumber": 1
                                                },
                                                "amount": {
                                                    "dataType": "uint64",
                                                    "fieldNumber": 2
                                                },
                                                "sharingCoefficients": {
                                                    "type": "array",
                                                    "fieldNumber": 3,
                                                    "items": {
                                                        "type": "object",
                                                        "required": [
                                                            "tokenID",
                                                            "coefficient"
                                                        ],
                                                        "properties": {
                                                            "tokenID": {
                                                                "dataType": "bytes",
                                                                "minLength": 8,
                                                                "maxLength": 8,
                                                                "fieldNumber": 1
                                                            },
                                                            "coefficient": {
                                                                "dataType": "bytes",
                                                                "maxLength": 24,
                                                                "fieldNumber": 2
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "pendingUnlocks": {
                                        "type": "array",
                                        "fieldNumber": 3,
                                        "items": {
                                            "type": "object",
                                            "required": [
                                                "validatorAddress",
                                                "amount",
                                                "unstakeHeight"
                                            ],
                                            "properties": {
                                                "validatorAddress": {
                                                    "dataType": "bytes",
                                                    "fieldNumber": 1,
                                                    "format": "lisk32"
                                                },
                                                "amount": {
                                                    "dataType": "uint64",
                                                    "fieldNumber": 2
                                                },
                                                "unstakeHeight": {
                                                    "dataType": "uint32",
                                                    "fieldNumber": 3
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "genesisData": {
                            "type": "object",
                            "fieldNumber": 3,
                            "required": [
                                "initRounds",
                                "initValidators"
                            ],
                            "properties": {
                                "initRounds": {
                                    "dataType": "uint32",
                                    "fieldNumber": 1
                                },
                                "initValidators": {
                                    "type": "array",
                                    "fieldNumber": 2,
                                    "items": {
                                        "dataType": "bytes",
                                        "format": "lisk32"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                "module": "random",
                "version": "2",
                "schema": {
                    "$id": "/modules/random/block/header/asset",
                    "type": "object",
                    "properties": {
                        "seedReveal": {
                            "dataType": "bytes",
                            "fieldNumber": 1,
                            "minLength": 16,
                            "maxLength": 16
                        }
                    },
                    "required": [
                        "seedReveal"
                    ]
                }
            },
            {
                "module": "token",
                "version": "0",
                "schema": {
                    "$id": "/token/module/genesis",
                    "type": "object",
                    "required": [
                        "userSubstore",
                        "supplySubstore",
                        "escrowSubstore",
                        "supportedTokensSubstore"
                    ],
                    "properties": {
                        "userSubstore": {
                            "type": "array",
                            "fieldNumber": 1,
                            "items": {
                                "type": "object",
                                "required": [
                                    "address",
                                    "tokenID",
                                    "availableBalance",
                                    "lockedBalances"
                                ],
                                "properties": {
                                    "address": {
                                        "dataType": "bytes",
                                        "format": "lisk32",
                                        "fieldNumber": 1
                                    },
                                    "tokenID": {
                                        "dataType": "bytes",
                                        "fieldNumber": 2,
                                        "minLength": 8,
                                        "maxLength": 8
                                    },
                                    "availableBalance": {
                                        "dataType": "uint64",
                                        "fieldNumber": 3
                                    },
                                    "lockedBalances": {
                                        "type": "array",
                                        "fieldNumber": 4,
                                        "items": {
                                            "type": "object",
                                            "required": [
                                                "module",
                                                "amount"
                                            ],
                                            "properties": {
                                                "module": {
                                                    "dataType": "string",
                                                    "minLength": 1,
                                                    "maxLength": 32,
                                                    "fieldNumber": 1
                                                },
                                                "amount": {
                                                    "dataType": "uint64",
                                                    "fieldNumber": 2
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "supplySubstore": {
                            "type": "array",
                            "fieldNumber": 2,
                            "items": {
                                "type": "object",
                                "required": [
                                    "tokenID",
                                    "totalSupply"
                                ],
                                "properties": {
                                    "tokenID": {
                                        "dataType": "bytes",
                                        "fieldNumber": 1,
                                        "minLength": 8,
                                        "maxLength": 8
                                    },
                                    "totalSupply": {
                                        "dataType": "uint64",
                                        "fieldNumber": 2
                                    }
                                }
                            }
                        },
                        "escrowSubstore": {
                            "type": "array",
                            "fieldNumber": 3,
                            "items": {
                                "type": "object",
                                "required": [
                                    "escrowChainID",
                                    "tokenID",
                                    "amount"
                                ],
                                "properties": {
                                    "escrowChainID": {
                                        "dataType": "bytes",
                                        "minLength": 4,
                                        "maxLength": 4,
                                        "fieldNumber": 1
                                    },
                                    "tokenID": {
                                        "dataType": "bytes",
                                        "fieldNumber": 2,
                                        "minLength": 8,
                                        "maxLength": 8
                                    },
                                    "amount": {
                                        "dataType": "uint64",
                                        "fieldNumber": 3
                                    }
                                }
                            }
                        },
                        "supportedTokensSubstore": {
                            "type": "array",
                            "fieldNumber": 4,
                            "items": {
                                "type": "object",
                                "required": [
                                    "chainID",
                                    "supportedTokenIDs"
                                ],
                                "properties": {
                                    "chainID": {
                                        "dataType": "bytes",
                                        "minLength": 4,
                                        "maxLength": 4,
                                        "fieldNumber": 1
                                    },
                                    "supportedTokenIDs": {
                                        "type": "array",
                                        "fieldNumber": 2,
                                        "items": {
                                            "dataType": "bytes",
                                            "minLength": 8,
                                            "maxLength": 8
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ],
        "commands": [
            {
                "moduleCommand": "auth:registerMultisignature",
                "schema": {
                    "$id": "/auth/command/regMultisig",
                    "type": "object",
                    "properties": {
                        "numberOfSignatures": {
                            "dataType": "uint32",
                            "fieldNumber": 1,
                            "minimum": 1,
                            "maximum": 64
                        },
                        "mandatoryKeys": {
                            "type": "array",
                            "items": {
                                "dataType": "bytes",
                                "minLength": 32,
                                "maxLength": 32
                            },
                            "fieldNumber": 2,
                            "minItems": 0,
                            "maxItems": 64
                        },
                        "optionalKeys": {
                            "type": "array",
                            "items": {
                                "dataType": "bytes",
                                "minLength": 32,
                                "maxLength": 32
                            },
                            "fieldNumber": 3,
                            "minItems": 0,
                            "maxItems": 64
                        },
                        "signatures": {
                            "type": "array",
                            "items": {
                                "dataType": "bytes",
                                "minLength": 64,
                                "maxLength": 64
                            },
                            "fieldNumber": 4
                        }
                    },
                    "required": [
                        "numberOfSignatures",
                        "mandatoryKeys",
                        "optionalKeys",
                        "signatures"
                    ]
                }
            },
            {
                "moduleCommand": "interoperability:submitMainchainCrossChainUpdate",
                "schema": {
                    "$id": "/modules/interoperability/ccu",
                    "type": "object",
                    "required": [
                        "sendingChainID",
                        "certificate",
                        "activeValidatorsUpdate",
                        "certificateThreshold",
                        "inboxUpdate"
                    ],
                    "properties": {
                        "sendingChainID": {
                            "dataType": "bytes",
                            "fieldNumber": 1,
                            "minLength": 4,
                            "maxLength": 4
                        },
                        "certificate": {
                            "dataType": "bytes",
                            "fieldNumber": 2
                        },
                        "activeValidatorsUpdate": {
                            "type": "object",
                            "fieldNumber": 3,
                            "required": [
                                "blsKeysUpdate",
                                "bftWeightsUpdate",
                                "bftWeightsUpdateBitmap"
                            ],
                            "properties": {
                                "blsKeysUpdate": {
                                    "type": "array",
                                    "fieldNumber": 1,
                                    "items": {
                                        "dataType": "bytes",
                                        "minLength": 48,
                                        "maxLength": 48
                                    }
                                },
                                "bftWeightsUpdate": {
                                    "type": "array",
                                    "fieldNumber": 2,
                                    "items": {
                                        "dataType": "uint64"
                                    }
                                },
                                "bftWeightsUpdateBitmap": {
                                    "dataType": "bytes",
                                    "fieldNumber": 3
                                }
                            }
                        },
                        "certificateThreshold": {
                            "dataType": "uint64",
                            "fieldNumber": 4
                        },
                        "inboxUpdate": {
                            "type": "object",
                            "fieldNumber": 5,
                            "required": [
                                "crossChainMessages",
                                "messageWitnessHashes",
                                "outboxRootWitness"
                            ],
                            "properties": {
                                "crossChainMessages": {
                                    "type": "array",
                                    "fieldNumber": 1,
                                    "items": {
                                        "dataType": "bytes"
                                    }
                                },
                                "messageWitnessHashes": {
                                    "type": "array",
                                    "fieldNumber": 2,
                                    "items": {
                                        "dataType": "bytes",
                                        "minLength": 32,
                                        "maxLength": 32
                                    }
                                },
                                "outboxRootWitness": {
                                    "type": "object",
                                    "fieldNumber": 3,
                                    "required": [
                                        "bitmap",
                                        "siblingHashes"
                                    ],
                                    "properties": {
                                        "bitmap": {
                                            "dataType": "bytes",
                                            "fieldNumber": 1
                                        },
                                        "siblingHashes": {
                                            "type": "array",
                                            "fieldNumber": 2,
                                            "items": {
                                                "dataType": "bytes",
                                                "minLength": 32,
                                                "maxLength": 32
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                "moduleCommand": "interoperability:initializeMessageRecovery",
                "schema": {
                    "$id": "/modules/interoperability/mainchain/messageRecoveryInitialization",
                    "type": "object",
                    "required": [
                        "chainID",
                        "channel",
                        "bitmap",
                        "siblingHashes"
                    ],
                    "properties": {
                        "chainID": {
                            "dataType": "bytes",
                            "fieldNumber": 1,
                            "minLength": 4,
                            "maxLength": 4
                        },
                        "channel": {
                            "dataType": "bytes",
                            "fieldNumber": 2
                        },
                        "bitmap": {
                            "dataType": "bytes",
                            "fieldNumber": 3
                        },
                        "siblingHashes": {
                            "type": "array",
                            "items": {
                                "dataType": "bytes",
                                "minLength": 32,
                                "maxLength": 32
                            },
                            "fieldNumber": 4
                        }
                    }
                }
            },
            {
                "moduleCommand": "interoperability:recoverMessage",
                "schema": {
                    "$id": "/modules/interoperability/mainchain/messageRecovery",
                    "type": "object",
                    "required": [
                        "chainID",
                        "crossChainMessages",
                        "idxs",
                        "siblingHashes"
                    ],
                    "properties": {
                        "chainID": {
                            "dataType": "bytes",
                            "minLength": 4,
                            "maxLength": 4,
                            "fieldNumber": 1
                        },
                        "crossChainMessages": {
                            "type": "array",
                            "items": {
                                "dataType": "bytes"
                            },
                            "fieldNumber": 2
                        },
                        "idxs": {
                            "type": "array",
                            "items": {
                                "dataType": "uint32"
                            },
                            "fieldNumber": 3
                        },
                        "siblingHashes": {
                            "type": "array",
                            "items": {
                                "dataType": "bytes",
                                "minLength": 32,
                                "maxLength": 32
                            },
                            "fieldNumber": 4
                        }
                    }
                }
            },
            {
                "moduleCommand": "interoperability:registerSidechain",
                "schema": {
                    "$id": "/modules/interoperability/mainchain/sidechainRegistration",
                    "type": "object",
                    "required": [
                        "chainID",
                        "name",
                        "sidechainValidators",
                        "sidechainCertificateThreshold"
                    ],
                    "properties": {
                        "chainID": {
                            "dataType": "bytes",
                            "fieldNumber": 1,
                            "minLength": 4,
                            "maxLength": 4
                        },
                        "name": {
                            "dataType": "string",
                            "fieldNumber": 2,
                            "minLength": 1,
                            "maxLength": 32
                        },
                        "sidechainValidators": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "required": [
                                    "blsKey",
                                    "bftWeight"
                                ],
                                "properties": {
                                    "blsKey": {
                                        "dataType": "bytes",
                                        "fieldNumber": 1,
                                        "minLength": 48,
                                        "maxLength": 48
                                    },
                                    "bftWeight": {
                                        "dataType": "uint64",
                                        "fieldNumber": 2
                                    }
                                }
                            },
                            "minItems": 1,
                            "fieldNumber": 3,
                            "maxItems": 199
                        },
                        "sidechainCertificateThreshold": {
                            "dataType": "uint64",
                            "fieldNumber": 4
                        }
                    }
                }
            },
            {
                "moduleCommand": "interoperability:recoverState",
                "schema": {
                    "$id": "/modules/interoperability/mainchain/commands/stateRecovery",
                    "type": "object",
                    "required": [
                        "chainID",
                        "module",
                        "storeEntries",
                        "siblingHashes"
                    ],
                    "properties": {
                        "chainID": {
                            "dataType": "bytes",
                            "fieldNumber": 1,
                            "minLength": 4,
                            "maxLength": 4
                        },
                        "module": {
                            "dataType": "string",
                            "fieldNumber": 2,
                            "minLength": 1,
                            "maxLength": 32
                        },
                        "storeEntries": {
                            "type": "array",
                            "fieldNumber": 3,
                            "items": {
                                "type": "object",
                                "properties": {
                                    "substorePrefix": {
                                        "dataType": "bytes",
                                        "fieldNumber": 1,
                                        "minLength": 2,
                                        "maxLength": 2
                                    },
                                    "storeKey": {
                                        "dataType": "bytes",
                                        "fieldNumber": 2
                                    },
                                    "storeValue": {
                                        "dataType": "bytes",
                                        "fieldNumber": 3
                                    },
                                    "bitmap": {
                                        "dataType": "bytes",
                                        "fieldNumber": 4
                                    }
                                },
                                "required": [
                                    "substorePrefix",
                                    "storeKey",
                                    "storeValue",
                                    "bitmap"
                                ]
                            }
                        },
                        "siblingHashes": {
                            "type": "array",
                            "items": {
                                "dataType": "bytes",
                                "minLength": 32,
                                "maxLength": 32
                            },
                            "fieldNumber": 4
                        }
                    }
                }
            },
            {
                "moduleCommand": "interoperability:terminateSidechainForLiveness",
                "schema": {
                    "$id": "/modules/interoperability/mainchain/terminateSidechainForLiveness",
                    "type": "object",
                    "required": [
                        "chainID"
                    ],
                    "properties": {
                        "chainID": {
                            "dataType": "bytes",
                            "fieldNumber": 1,
                            "minLength": 4,
                            "maxLength": 4
                        }
                    }
                }
            },
            {
                "moduleCommand": "legacy:reclaimLSK",
                "schema": {
                    "$id": "/legacy/command/reclaimLSKParams",
                    "type": "object",
                    "required": [
                        "amount"
                    ],
                    "properties": {
                        "amount": {
                            "dataType": "uint64",
                            "fieldNumber": 1
                        }
                    }
                }
            },
            {
                "moduleCommand": "legacy:registerKeys",
                "schema": {
                    "$id": "/legacy/command/registerKeysParams",
                    "type": "object",
                    "required": [
                        "blsKey",
                        "proofOfPossession",
                        "generatorKey"
                    ],
                    "properties": {
                        "blsKey": {
                            "dataType": "bytes",
                            "minLength": 48,
                            "maxLength": 48,
                            "fieldNumber": 1
                        },
                        "proofOfPossession": {
                            "dataType": "bytes",
                            "minLength": 96,
                            "maxLength": 96,
                            "fieldNumber": 2
                        },
                        "generatorKey": {
                            "dataType": "bytes",
                            "minLength": 32,
                            "maxLength": 32,
                            "fieldNumber": 3
                        }
                    }
                }
            },
            {
                "moduleCommand": "pos:registerValidator",
                "schema": {
                    "$id": "/pos/command/registerValidatorParams",
                    "type": "object",
                    "required": [
                        "name",
                        "blsKey",
                        "proofOfPossession",
                        "generatorKey"
                    ],
                    "properties": {
                        "name": {
                            "dataType": "string",
                            "fieldNumber": 1
                        },
                        "blsKey": {
                            "dataType": "bytes",
                            "minLength": 48,
                            "maxLength": 48,
                            "fieldNumber": 2
                        },
                        "proofOfPossession": {
                            "dataType": "bytes",
                            "minLength": 96,
                            "maxLength": 96,
                            "fieldNumber": 3
                        },
                        "generatorKey": {
                            "dataType": "bytes",
                            "minLength": 32,
                            "maxLength": 32,
                            "fieldNumber": 4
                        }
                    }
                }
            },
            {
                "moduleCommand": "pos:reportMisbehavior",
                "schema": {
                    "$id": "/pos/command/reportMisbehaviorParams",
                    "type": "object",
                    "required": [
                        "header1",
                        "header2"
                    ],
                    "properties": {
                        "header1": {
                            "dataType": "bytes",
                            "fieldNumber": 1
                        },
                        "header2": {
                            "dataType": "bytes",
                            "fieldNumber": 2
                        }
                    }
                }
            },
            {
                "moduleCommand": "pos:unlock",
                "schema": {
                    "$id": "/lisk/empty",
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "moduleCommand": "pos:updateGeneratorKey",
                "schema": {
                    "$id": "/pos/command/updateGeneratorKeyParams",
                    "type": "object",
                    "required": [
                        "generatorKey"
                    ],
                    "properties": {
                        "generatorKey": {
                            "dataType": "bytes",
                            "fieldNumber": 1,
                            "minLength": 32,
                            "maxLength": 32
                        }
                    }
                }
            },
            {
                "moduleCommand": "pos:stake",
                "schema": {
                    "$id": "/pos/command/stakeValidatorParams",
                    "type": "object",
                    "required": [
                        "stakes"
                    ],
                    "properties": {
                        "stakes": {
                            "type": "array",
                            "fieldNumber": 1,
                            "minItems": 1,
                            "maxItems": 20,
                            "items": {
                                "type": "object",
                                "required": [
                                    "validatorAddress",
                                    "amount"
                                ],
                                "properties": {
                                    "validatorAddress": {
                                        "dataType": "bytes",
                                        "fieldNumber": 1,
                                        "format": "lisk32"
                                    },
                                    "amount": {
                                        "dataType": "sint64",
                                        "fieldNumber": 2
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                "moduleCommand": "pos:changeCommission",
                "schema": {
                    "$id": "/pos/command/changeCommissionCommandParams",
                    "type": "object",
                    "required": [
                        "newCommission"
                    ],
                    "properties": {
                        "newCommission": {
                            "dataType": "uint32",
                            "fieldNumber": 1,
                            "maximum": 10000
                        }
                    }
                }
            },
            {
                "moduleCommand": "pos:claimRewards",
                "schema": {
                    "$id": "/lisk/empty",
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "moduleCommand": "token:transfer",
                "schema": {
                    "$id": "/lisk/transferParams",
                    "title": "Transfer transaction params",
                    "type": "object",
                    "required": [
                        "tokenID",
                        "amount",
                        "recipientAddress",
                        "data"
                    ],
                    "properties": {
                        "tokenID": {
                            "dataType": "bytes",
                            "fieldNumber": 1,
                            "minLength": 8,
                            "maxLength": 8
                        },
                        "amount": {
                            "dataType": "uint64",
                            "fieldNumber": 2
                        },
                        "recipientAddress": {
                            "dataType": "bytes",
                            "fieldNumber": 3,
                            "format": "lisk32"
                        },
                        "data": {
                            "dataType": "string",
                            "fieldNumber": 4,
                            "minLength": 0,
                            "maxLength": 64
                        }
                    }
                }
            },
            {
                "moduleCommand": "token:transferCrossChain",
                "schema": {
                    "$id": "/lisk/ccTransferParams",
                    "type": "object",
                    "required": [
                        "tokenID",
                        "amount",
                        "receivingChainID",
                        "recipientAddress",
                        "data",
                        "messageFee",
                        "messageFeeTokenID"
                    ],
                    "properties": {
                        "tokenID": {
                            "dataType": "bytes",
                            "fieldNumber": 1,
                            "minLength": 8,
                            "maxLength": 8
                        },
                        "amount": {
                            "dataType": "uint64",
                            "fieldNumber": 2
                        },
                        "receivingChainID": {
                            "dataType": "bytes",
                            "fieldNumber": 3,
                            "minLength": 4,
                            "maxLength": 4
                        },
                        "recipientAddress": {
                            "dataType": "bytes",
                            "fieldNumber": 4,
                            "format": "lisk32"
                        },
                        "data": {
                            "dataType": "string",
                            "fieldNumber": 5,
                            "minLength": 0,
                            "maxLength": 64
                        },
                        "messageFee": {
                            "dataType": "uint64",
                            "fieldNumber": 6
                        },
                        "messageFeeTokenID": {
                            "dataType": "bytes",
                            "fieldNumber": 7,
                            "minLength": 8,
                            "maxLength": 8
                        }
                    }
                }
            }
        ],
        "messages": [
            {
                "moduleCommand": "auth:registerMultisignature",
                "param": "signatures",
                "schema": {
                    "$id": "/auth/command/regMultisigMsg",
                    "type": "object",
                    "required": [
                        "address",
                        "nonce",
                        "numberOfSignatures",
                        "mandatoryKeys",
                        "optionalKeys"
                    ],
                    "properties": {
                        "address": {
                            "dataType": "bytes",
                            "fieldNumber": 1,
                            "minLength": 20,
                            "maxLength": 20
                        },
                        "nonce": {
                            "dataType": "uint64",
                            "fieldNumber": 2
                        },
                        "numberOfSignatures": {
                            "dataType": "uint32",
                            "fieldNumber": 3
                        },
                        "mandatoryKeys": {
                            "type": "array",
                            "items": {
                                "dataType": "bytes",
                                "minLength": 32,
                                "maxLength": 32
                            },
                            "fieldNumber": 4
                        },
                        "optionalKeys": {
                            "type": "array",
                            "items": {
                                "dataType": "bytes",
                                "minLength": 32,
                                "maxLength": 32
                            },
                            "fieldNumber": 5
                        }
                    }
                }
            }
        ]
    },
    "meta": {}
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

Get schemas
```
https://service.lisk.com/api/v3/schemas
```

## Interoperability

### Interoperable applications

Retrieves blockchain applications in the current network.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/blockchain/apps`
- RPC `get.blockchain.apps`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| chainID | String | `/^\b[a-fA-F0-9]{8}\b$/` | *(empty)* | Can be expressed as CSV. |
| name | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| status | String | `/^\b(?:registered\|active\|terminated\|unregistered\|,)+\b$/` | *(empty)* | Can be expressed as CSV. |
| search | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |

#### Response example

200 OK

```jsonc
{
  "data": [
    {
      "name": "Lisk",
      "chainID": "00000000",
      "status": "active",
      "address": "lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99",
      "lastCertificateHeight": 160,
      "lastUpdated": 1616008148
    }
  ],
  "meta": {
    "count": 10,
    "offset": 10,
    "total": 400
  }
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

```
https://service.lisk.com/api/v3/blockchain/apps
```

### Interoperable network statistics

Retrieves statistics for the current network blockchain applications.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/blockchain/apps/statistics`
- RPC `get.blockchain.apps.statistics`

#### Request parameters

No parameters are required.

#### Response example

200 OK

```jsonc
{
  "data": {
    "registered": 2503,
    "active": 2328,
    "terminated": 35,
    "totalSupplyLSK": "5000000",
    "totalStakedLSK": "3000000",
    "currentAnnualInflationRate": "4.50"
  },
  "meta": {}
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

```
https://service.lisk.com/api/v3/blockchain/apps/statistics
```

## Index Status

### Current indexing status

Retrieves the current indexing status.

#### Endpoints

- HTTP GET `/api/v3/index/status`
- RPC `get.index.status`

#### Request parameters

No parameters are required.

#### Response example

200 OK

```jsonc
{
  "data": {
    "genesisHeight": 0,
    "lastBlockHeight": 2330,
    "lastIndexedBlockHeight": 2330,
    "chainLength": 2331,
    "numBlocksIndexed": 2330,
    "percentageIndexed": 99.96,
    "isIndexingInProgress": true
  },
  "meta": {
    "lastUpdate": 1632471013
  }
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

Get current index status
```
https://service.lisk.com/api/v3/index/status
```


## Proxy

### Invoke Application Endpoints

Proxy request to directly invoke application endpoint. Returns endpoint response from the blockchain application in its original form.

#### Endpoints

- HTTP POST `/api/v3/invoke`
- RPC `post.invoke`

#### Request body parameters

```jsonc
{
  "endpoint": "chain_getBlockByHeight", // Required: Blockchain application endpoint to invoke
  "params": { // Optional: Parameters to be passed corresponding to the invoked application endpoint
    "height": 10
  }
}
```

#### Response example

200 OK
```jsonc
{
  "data": {
    "header": {
      "id": "01967dba384998026fe028119bd099ecf073c05c045381500a93d1a7c7307e5b",
      "version": 0,
      "height": 8344448,
      "timestamp": 85944650,
      "previousBlockId": "827080df7829cd2757501a85f80a0767fcb40615304b701c2890dbbaf214bb89",
      "generatorAddress": "cd56330913e4517f35cf689e849f5c208ed48b8e",
      "transactionRoot": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "assetsRoot": "6e904b2f678eb3b6c3042acb188a607d903d441d61508d047fe36b3c982995c8",
      "stateRoot": "95d9b1773b78034b8df9ac741c903b881da761d8ba002a939de28a4b86982c04",
      "maxHeightGenerated": 559421,
      "maxHeightPrevoted": 559434,
      "validatorsHash": "ad0076aa444f6cda608bb163c3bd77d9bf172f1d2803d53095bc0f277db6bcb3",
      "aggregateCommit": {
        "height": "166",
        "aggregationBits": "ffffffffffffffffffffffff1f",
        "certificateSignature": "a7db952f87db29718c40afca9a9fb2f6b605f8588c1c99e41e92f26ec005e6d14327c33051fa383fe903b7040d16c7441570167a73d9468aa16a6720c765b3f22aeca42102c45b4616fd7543d7a0649e0fa934e0de1973486eede9d56f014f9f"
      },
      "signature": "a3733254aad600fa787d6223002278c3400be5e8ed4763ae27f9a15b80e20c22ac9259dc926f4f4cabdf0e4f8cec49308fa8296d71c288f56b9d1e11dfe81e07"
    },
    "assets": [
      {
        "module": "token",
        "data": "0a14e135813f51103e7645ed87a0562a823d2fd48bc612207eef331c6d58f3962f5fb35b13f780f0ee7d93fbc37a3e9f4ccbdc6d1551db801a303629827aaa0836111137215708fd2007e9221ca1d56b29b98d8e9747ec3243c0549dc2091515d2bdd72fb28acef50160"
      }
    ],
    "transactions": [
      {
        "module": "token",
        "command": "transfer",
        "nonce": "0",
        "fee": "1000000",
        "senderPublicKey": "b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd",
        "params": {
          "amount": "100003490",
          "recipientAddress": "0f16f2cd587679d5fd686584b5018d4f844348ac",
          "data": "test"
        }
      }
    ]
  },
  "meta": {
    "endpoint": "chain_getBlockByHeight",
    "params": {
      "height": 10
    }
  }
}
```

400 Bad Request
```
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>"
}
```

#### Examples

Get legacy account details by publicKey

```
https://service.lisk.com/api/v3/legacy?publicKey=b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd
```

# Off-chain Features

## Application Metadata

### Application metadata overview

Retrieves a list of blockchain applications for which the metadata exists.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/blockchain/apps/meta/list`
- RPC `get.blockchain.apps.meta.list`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| chainName | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| network | String | `/^\b(?:mainnet\|testnet\|betanet\|alphanet\|devnet\|,)+\b$/` | *(empty)* | Can be expressed as CSV. |
| search | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |
| sort | Enum | `[chainName:asc, chainName:desc, chainID:asc, chainID:desc]` | chainName:asc |  |

#### Response example

200 OK

```jsonc
{
  "data": [
    {
      "chainName": "Lisk",
      "chainID": "00000000",
      "networkType": "mainnet"
    }
  ],
  "meta": {
    "count": 10,
    "offset": 10,
    "total": 400
  }
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

```
https://service.lisk.com/api/v3/blockchain/apps/meta/list
```

### Application metadata details

Retrieves metadata for a list of blockchain applications. The information is used by the wallets.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/blockchain/apps/meta`
- RPC `get.blockchain.apps.meta`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| chainName | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| chainID | String | `/^\b[a-fA-F0-9]{8}\b$/` | *(empty)* | Can be expressed as CSV. |
| isDefault | Boolean | `[true, false]` | *(empty)* |  |
| network | String | `/^\b(?:mainnet\|testnet\|betanet\|alphanet\|devnet\|,)+\b$/` | *(empty)* | Can be expressed as CSV. |
| search | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |
| sort | Enum | `[chainName:asc, chainName:desc, chainID:asc, chainID:desc]` | chainName:asc |  |
#### Response example

200 OK

```jsonc
{
  "data": [
    {
      "chainName": "Lisk",
      "chainID": "00000000",
      "title": "Lisk blockchain application",
      "status": "active",
      "description": "Lisk is a blockchain application platform",
      "networkType": "mainnet",
      "isDefault": true,
      "genesisURL": "https://downloads.lisk.com/lisk/mainnet/genesis_block.json.tar.gz",
      "projectPage": "https://lisk.com",
      "serviceURLs": [
        {
          "http": "https://service.lisk.com",
          "ws": "wss://service.lisk.com"
        }
      ],
      "logo": {
        "png": "https://downloads.lisk.com/lisk/images/logo.png",
        "svg": "https://downloads.lisk.com/lisk/images/logo.svg"
      },
      "appPage": "https://lisk.com",
      "backgroundColor": "#0981D1",
      "explorers": [
        {
          "url": "https://lisk.observer",
          "txnPage": "https://lisk.observer/transactions"
        }
      ],
      "appNodes": [
        {
          "url": "https://mainnet.lisk.com",
          "maintainer": "Lightcurve GmbH"
        }
      ]
    }
  ],
  "meta": {
    "count": 10,
    "offset": 10,
    "total": 400
  }
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

```
https://service.lisk.com/api/v3/blockchain/apps/meta
```

### Application native token metadata details

Retrieves the metadata for the tokens. The information is used by the wallets.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/blockchain/apps/meta/tokens`
- RPC `get.blockchain.apps.meta.tokens`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| chainName | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| chainID | String | `/^\b[a-fA-F0-9]{8}\b$/` | *(empty)* | Can be expressed as CSV. |
| tokenName | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| tokenID | String | `/^\b[a-fA-F0-9]{16}\b$/` | *(empty)* | Can be expressed as CSV. |
| network | String | `/^\b(?:mainnet\|testnet\|betanet\|alphanet\|devnet\|,)+\b$/` | *(empty)* | Can be expressed as CSV. |
| search | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |
| sort | Enum | `[chainName:asc, chainName:desc]` | chainName:asc |  |
#### Response example

200 OK

```jsonc
{
  "data": [
    {
      "chainID": "00000000",
      "chainName": "Lisk",
      "tokenID": "Lisk",
      "tokenName": "00000000",
      "networkType": "mainnet",
      "description": "LSK is the utility token of Lisk",
      "denomUnits": [
        {
          "denom": "lsk",
          "decimals": 8,
          "aliases": [
            "LISK"
          ]
        }
      ],
      "symbol": "LSK",
      "displayDenom": "LSK",
      "baseDenom": "beddows",
      "logo": {
        "png": "https://downloads.lisk.com/lisk/images/logo.png",
        "svg": "https://downloads.lisk.com/lisk/images/logo.svg"
      }
    }
  ],
  "meta": {
    "count": 10,
    "offset": 10,
    "total": 400
  }
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

```
https://service.lisk.com/api/v3/blockchain/apps/meta/tokens
```

### Application-supported token metadata details

Retrieves the metadata for the tokens supported by the specified blockchain application. The information is used by the wallets.
This endpoint internally queries the `/token/summary` for the specified chainID and considers the `supportedTokens` information to collate the relevant metadata.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/blockchain/apps/meta/tokens/supported`
- RPC `get.blockchain.apps.meta.tokens.supported`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| chainID | String | `/^\b[a-fA-F0-9]{8}\b$/` | *(empty)* | Can be expressed as CSV. |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[0,Inf)` | 0 |  |
| sort | Enum | `[tokenID:asc, tokenID:desc]` | tokenID:asc |  |
#### Response example

200 OK

```jsonc
{
  "data": [
    {
      "chainID": "00000000",
      "chainName": "Lisk",
      "tokenID": "0000000000000000",
      "tokenName": "Lisk",
      "networkType": "mainnet",
      "description": "Default token for the entire Lisk ecosystem",
      "logo": {
        "png": "https://downloads.lisk.com/lisk/images/logo.png",
        "svg": "https://downloads.lisk.com/lisk/images/logo.svg"
      },
      "symbol": "LSK",
      "displayDenom": "lsk",
      "baseDenom": "beddows",
      "denomUnits": [
        {
          "denom": "beddows",
          "decimals": 0,
          "aliases": [
            "Beddows"
          ]
        },
        {
          "denom": "lsk",
          "decimals": 8,
          "aliases": [
            "Lisk"
          ]
        }
      ]
    }
  ],
  "meta": {
    "count": 1,
    "offset": 0,
    "total": 1
  }
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

```
https://service.lisk.com/api/v3/blockchain/apps/meta/tokens/supported?chainID=00000000
```

## Market Prices

Retrieves current market prices.

#### Endpoints

- HTTP GET `/api/v3/market/prices`
- RPC `get.market.prices`

#### Request parameters

No parameters are required.

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

## Account History Export

Returns transaction history export scheduling information

#### Endpoints

- HTTP GET `/api/v3/transactions/export`
- RPC `get.transactions.export`

#### Request parameters

| Parameter | Type             | Validation                                                 | Default        | Comment                                |
| --------- | ---------------- | ---------------------------------------------------------- | -------------- | -------------------------------------- |
| address   | String           | `/^lsk[a-hjkm-z2-9]{38}$//^[1-9]\d{0,19}[L\|l]$/`          | *(empty)*      |  One of address or publicKey required  |
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

The file is ready to export

200 OK
```jsonc
{
  "data": {
    "address": "lskdxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yt",
    "interval": "2021-03-16:2021-12-06",
    "fileName": "transactions_lskdxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yt_2021-03-16_2021-12-06.csv",
    "fileUrl": "/api/v3/exports/transactions_lskdxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yt_2021-03-16_2021-12-06.csv"
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

File retrieval

#### Endpoints

- HTTP GET `/api/v3/exports/{filename}`
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
