# Lisk Service API Documentation

Lisk Service is a middleware web application that interacts with the entire Lisk ecosystem in various aspects, such as accessing blockchain data, storing users' private data, retrieving and storing the market data, and interacting with social media.

The main focus of this project is to provide data to Lisk blockchain users by serving them in a standardized JSON format and exposing a public RESTful API. The project is split into several smaller components each focused on serving a single specific purpose.

As a pure backend project, it is designed to meet the requirements of the frontend developers, especially Lisk Desktop and Lisk Mobile.

The API can be accessed at `https://service.lisk.com`.
It is also possible to access the Testnet network at `https://testnet-service.lisk.com`.

The Lisk Service API is compatible with RESTful guidelines. The specification below contains numerous examples of how to use the API in practice.

## Table of Contents

- [Lisk Service HTTP API Documentation](#lisk-service-http-api-documentation)
  - [API Status and Readiness](#api-status-and-readiness)
  - [Base URL](#base-url)
  - [Endpoint logic](#endpoint-logic)
  - [Response format](#response-format)
- [Lisk Blockchain-related Endpoints](#lisk-blockchain-related-endpoints)
  - [Blocks](#blocks)
    - [Block search](#block-search)
  - [Transactions](#transactions)
    - [Transaction search](#transaction-search)
    - [Transaction broadcast](#transaction-broadcast)
    - [Transaction statistics](#transaction-statistics)
    - [Transaction schema](#transaction-schema)
    - [Dynamic fees](#dynamic-fees)
  - [Events](#events)
  - [Auth](#auth)
  - [Validator](#validator)
  - [Token](#token)
  - [Dynamic Fees](#dynamic-fees)
  - [Interoperability](#interoperability)
  - [PoS](#proof-of-stake)
  - [Reward](#reward)
  - [Legacy](#legacy)
  - [Network](#network)
    - [Network peers](#network-peers)
    - [Network status](#network-status)
    - [Network statistics](#network-statistics)
  - [Generators](#generators)
  - [Schemas](#schemas)
  - [Index Status](#index-status)
  - [Proxy](#proxy)
- [Off-chain Features](#off-chain-features)
  - [Market Prices](#market-prices)
  - [Account History Export](#account-history-export)

## API Status and Readiness

Lisk Service offers `/status` and `/ready` endpoints to check the current deployment and a high-level service readiness statuses respectively. These endpoints must be queried without the [base URL](#base-url).
<br/>*Example*: https://service.lisk.com/api/status, https://service.lisk.com/api/ready

## Base URL

The base URL for the Lisk Service v3 API is `/api/v3`. All the RESTful endpoints specified below follow the base URL.
<br/>*Example*: https://service.lisk.com/api/v3/spec

The WS-RPC endpoints however are available to query under the `/rpc-v3` namespace.
<br/>*Example*: https://service.lisk.com/api/rpc-v3

## Endpoint Logic

The logic of the endpoints are as follows:
The structure is always based on `/<root_entity or module>/<object>/<properties>`.

## Response format

All responses are returned in the JSON format - `application/json`.

Each API request has the following structure:

```jsonc
{
  "data": {}, // Contains the requested data
  "meta": {}, // Contains additional metadata, e.g. the values of `limit` and `offset`
}
```

And, the error responses adhere to the following structure:

```jsonc
{
  "error": true,
  "message": "Unknown input parameter(s): <param_name>", // Contains the error message
}
```

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
| height | String | `/([0-9]+\|[0-9]+:[0-9]+)/` | *(empty)* | Can be expressed as an interval i.e. `1:20` |
| timestamp | String | `/([0-9]+\|[0-9]+:[0-9]+)/` | *(empty)* | Can be expressed as interval i.e. `100000:200000` |
| generatorAddress | String | `/^lsk[a-hjkm-z2-9]{38}$/` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[1,Inf)` | 0 |  |
| sort | Enum | `["height:asc", "height:desc","timestamp:asc", "timestamp:desc"]` | height:desc |  |

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
| height | String | `/([0-9]+\|[0-9]+:[0-9]+)/` | *(empty)* | Can be expressed as an interval i.e. `1:20` |
| timestamp | String | `/([0-9]+\|[0-9]+:[0-9]+)/` | *(empty)* | Can be expressed as interval i.e. `100000:200000` |
| module | String | `/^\b(?:[\w!@$&.]{1,32}\|,)+\b$/` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[1,Inf)` | 0 |  |
| sort | Enum | `["height:asc", "height:desc","timestamp:asc", "timestamp:desc"]` | height:desc |  |

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

Retrieves network transactions by criteria defined by params.

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
| height | String | `/([0-9]+\|[0-9]+:[0-9]+)/` | *(empty)* | Can be expressed as an interval i.e. `1:20` |
| executionStatus | String | `/^\b(?:pending\|success\|fail\|,)+\b$/` | *(empty)* | Can be expressed as a CSV |
| nonce | Number | `/^[0-9]+$/` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[1,Inf)` | 0 |  |
| sort | Enum | `["height:asc", "height:desc","timestamp:asc", "timestamp:desc"]` | height:desc |  |
| order | Enum | `['index:asc', 'index:desc']` | index:asc | The order condition is applied after the sort condition, usually to break ties when the sort condition results in collision. |

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

Get last 25 transactions for account `lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu`

```
https://service.lisk.com/api/v3/transactions?address=lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu
```

### Transaction broadcast

Sends encoded transaction to the network node.

#### Endpoints

- HTTP POST `/api/v3/transactions​`
- RPC `post.transactions`


#### Request parameters

No params required.

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

### Transaction dryrun

Sends decoded/encoded transactions to the network node.

#### Endpoints

- HTTP POST `/api/v3/transactions/dryrun​`
- RPC `post.transactions.dryrun`


#### Request parameters

No params required.

Request payload:

```jsonc
{
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

### Transaction statistics

Retrieves daily network transactions statistics for time spans defined by params.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/transactions​/statistics​`
- RPC `get.transactions.statistics​`


#### Request parameters


| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| interval | Enum | `["day", "month"]` | *(empty)* | Required field |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[1,Inf)` | 0 |  |

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
| height | String | `/([0-9]+\|[0-9]+:[0-9]+)/` | *(empty)* | Can be expressed as an interval i.e. `1:20` |
| timestamp | String | `/([0-9]+\|[0-9]+:[0-9]+)/` | *(empty)* | Can be expressed as interval i.e. `100000:200000` |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[1,Inf)` | 0 |  |
| sort | Enum | `["height:asc", "height:desc","timestamp:asc", "timestamp:desc"]` | height:desc |  |
| order | Enum | `['index:asc', 'index:desc']` | index:asc | The order condition is applied after the sort condition, usually to break ties when the sort condition results in collision. |

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

## Auth

### Auth Details

Retrieves user-specific details form the Auth module.

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

Retrieves user-specific details form the Validator module.

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

No params required.

Request payload:

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
| address | String | `/^lsk[a-hjkm-z2-9]{38}$/` | *(empty)* | Required |
<!-- | publicKey | String | `/^([A-Fa-f0-9]{2}){32}$/;` | *(empty)* |  | -->
<!-- | name | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  | -->

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

Retrieves balances from the Token sub-store for the specified address.

#### Endpoints

- HTTP GET `/api/v3/token/balances`
- RPC `get.token.balances`

#### Request parameters

| Parameter | Type | Validation | Default | Comment |
| --------- | ---- | ---------- | ------- | ------- |
| address | String | `/^lsk[a-hjkm-z2-9]{38}$/` | *(empty)* | Required |
<!-- | publicKey | String | `/^([A-Fa-f0-9]{2}){32}$/;` | *(empty)* |  | -->
<!-- | name | String | `/^[\w!@$&.]{3,20}$/` | *(empty)* |  | -->
| tokenID | String | `/^\b[a-fA-F0-9]{16}\b$/` | *(empty)* |  |
| limit | Number | `[1,100]` | 10 |  |
| offset | Number | `[1,Inf)` | 0 |  |

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

### Token Constants

Retrieves module constants from the Token module.

#### Endpoints

- HTTP GET `/api/v3/token/constants`
- RPC `get.token.constants`

#### Request parameters

No params required.

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

No params required.

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


## Dynamic Fees

Requests transaction fee estimates per byte.

#### Endpoints

- HTTP GET `/api/v3/fees`
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


## Interoperability

### Interoperable applications (on-chain)

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
| offset | Number | `[1,Inf)` | 0 |  |

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

### Interoperable applications (on-chain) - network statistics

Retrieves statistics for the current network blockchain applications.

_Supports pagination._

#### Endpoints

- HTTP GET `/api/v3/blockchain/apps/statistics`
- RPC `get.blockchain.apps.statistics`

#### Request parameters

No params required.

#### Response example

200 OK

```jsonc
{
  "data": {
    "registered": 2503,
    "active": 2328,
    "terminated": 35,
    "totalSupplyLSK": "5000000",
    "stakedLSK": "3000000",
    "inflationRate": "4.50"
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

### Interoperable applications (off-chain) metadata list

Retrieves a list of blockchain applications for which the metadata exist.

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
| offset | Number | `[1,Inf)` | 0 |  |
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

### Interoperable applications (off-chain) metadata details

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
| offset | Number | `[1,Inf)` | 0 |  |
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

### Interoperable application token (off-chain) metadata details

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
| offset | Number | `[1,Inf)` | 0 |  |
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

### Interoperable application token (off-chain) metadata details for all tokens supported by a specific chain

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
| offset | Number | `[1,Inf)` | 0 |  |
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


## Network

### Network peers

Retrieves network peers with details based on criteria.

_Supports pagination._

#### Endpoints

- HTTP `/api/v3/peers`
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
https://service.lisk.com/api/v3/peers?ip=210.239.23.62
```

### Network status

Retrieves network details and constants such as network height, fees, reward amount etc.

#### Endpoints

- HTTP `/api/v3/network/status`
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
https://service.lisk.com/api/v3/network/status`
```

### Network statistics

Retrieves network statistics such as number of peers, node versions, heights etc.

#### Endpoints

- HTTP `/api/v3/network/statistics`
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
https://service.lisk.com/api/v3/network/statistics`
```

# Off-chain Features

## Market Prices

Retrieves current market prices.

#### Endpoints

- HTTP `/api/v3/market/prices`
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

## Account History Export

Returns transaction history export scheduling information

#### Endpoints

- HTTP `/api/v3/transactions/export`
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

404 Not Found
```jsonc
{
  "error": true,
  "message": "Account <account_id> not found."
}

```

File retrieval

#### Endpoints

- HTTP `/api/v3/exports/{filename}`
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
