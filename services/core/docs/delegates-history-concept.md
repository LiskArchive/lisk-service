# Lisk Service Delegate Profile History Concept

*10 December 2019*

## Abstract

Delegate Profile History is a module that provides API with history of delegate statistics over past year. 
It should enable users to analyze trends of delegates and voting.

## Motivation

This API is needed to provide data for our frontend applications. Specifically for "Statistics" box in Lisk Desktop Delegate profile page
![Screenshot 2019-12-05 at 12 26 36](https://user-images.githubusercontent.com/1254342/70231445-9efb8280-175a-11ea-9a49-2cc406d45b6c.png)

## Rationale
This module computes, stores and provides API with history of delegate statistics. 
The statistics are computed based on values obtained from Lisk Core APIs for current delegate statistics and history of transactions.
The statistics are stored in a PostgreSQL database with structure described in the "Database" section of this document.
Further details of the provided API are described in the following seciton of this document.
 
## Specification

This feature provides an API that provides delegate statistics history. 
The API returns historical values (voters, vote weight, approval) aggregated by day or month.

The values (voters, voteWeight, approval) for a delegate with adddess `XXXL` and for timestamp "now" should be:

- `approval`: `data[0].approval` from `/api/delegates?address=XXXL` Lisk Core API
- `voteWeight`: `data[0].vote` from `/api/delegates?address=XXXL` Lisk Core API
- `voters`: `data.votes` from `api/voters/?address=5201600508578320196L` Lisk Core API

For a timestamp in the past, the values above should correspond to what woud Lisk Core API return if the blockchain were rolled back to that time.

This API is meant to provide a history of 1 year, older data might not be available.

The overall architecture is described by the following diagram:

![architecture diagram](https://user-images.githubusercontent.com/1254342/70716618-f797c600-1cec-11ea-8e85-b6cc197a3964.png)


### API routes

This feature provides the following API endpoint. 

#### /api/v1/delegates/{account_id}/history/{aggregateBy}

Some example calls: 

- `/api/v1/delegate/4935562234363081651L/history/day?limit=7` - statistics for last 7 days (1 week view)
- `/api/v1/delegate/4935562234363081651L/history/day?limit=30` - statistics for last 7 days (1 month view)
- `/api/v1/delegate/4935562234363081651L/history/month?limit=12` - statistics for last 12 months (1 year view)

Sample response:
```json
{
  "data":  [{
     "datetime": "2019-11-25",
     "timestamp": "12387124012",
     "voters":  1243,
     "voteWeight":  "1132000000",
     "approval":  15.34,
  },{
     "datetime": "2019-11-26",
     "timestamp": "12386124012",
     "voters":  1242,
     "voteWeight":  "1131000000",
     "approval":  15.24,
  }, ...],
  "meta": {
    "aggregateBy": "day",
    "offset": 0,
    "limit": 7,
  },
  "links": {}
}
```

We might later separate each of `voteWeight`, `approval` and `voters` into 4 sub-values `xxxMin`, `xxxMax`, `xxxFirst`, `xxxLast`, to support candlestick chart.

### Database

The functionality is supported by one primary (`delegate_history`) and
3 auxiliary (`voter_history`, `account_history`, `supply_history`) database tables. 
The primary table contains all the data needed for the API.
The auxiliary tables provide data used to compute statistics for day `n-1` based on data from day `n`.

#### `delegate_history` table

```sql
    CREATE TABLE delegate_history (
      id serial PRIMARY KEY,
      timestamp TIMESTAMP NOT NULL,
      delegate_address VARCHAR(22) NOT NULL,
      vote_weight INTEGER DEFAULT NULL,
      approval INTEGER DEFAULT NULL,
      voter_count INTEGER DEFAULT NULL
    );
```

In table `delegate_history` we might later separate each of `vote_weight`, `approval` and `voter_count` into 4 sub-values `XXX_min`, `XXX_max`, `XXX_first`, `XXX_last`.

#### `voter_history` table

This table is used to retrieve list of all voters of a given delegate at the end of each day. 
It is needed for computation of `voter_count`, `vote_weight`, and `approval`.

```sql
    CREATE TABLE voter_history (
      id serial PRIMARY KEY,
      timestamp TIMESTAMP NOT NULL,
      delegate_address VARCHAR(22) NOT NULL,
      voter_address VARCHAR(22) NOT NULL
    );
```

#### `account_history` table

This table is used to retrieve balances of all accounts at the end of each day. 
It is needed for computation of `vote_weight`, and `approval`.

```sql
    CREATE TABLE account_history (
      id serial PRIMARY KEY,
      timestamp TIMESTAMP NOT NULL,
      address VARCHAR(22) NOT NULL,
      balance INTEGER DEFAULT NULL
    );
```

#### `supply_history` table

This table is used to retrieve total supply of the token at the end of each day. 
It is needed for computation of `approval`.

```sql
    CREATE TABLE supply_history (
      id serial PRIMARY KEY,
      timestamp TIMESTAMP NOT NULL,
      supply BIGIINT DEFAULT NULL
    );
```

### Technical details

The values of the statistics for each delegate are computed as follows.

#### voters
`voters` of the current timestamp is obtained as `data.voters` from `api/voters/?address=5201600508578320196L` Lisk Core API. They should be stored in `voter_history` table

Voters list of day `n-1` is computed based on voters list of day `n` and list of all `type=3` transactions of that day sorted retrospectivelly.
It should be doing the following for each of the transactions:
- if the transaction votes for a delegate, then remove the delegate from the list
- if the transaction unvotes a delegate, then add the delegate from the list



#### `vote_weight` in `delegate_history` table
`vote_weight` of the current timestamp is obtained as `data[0].vote` from `/api/delegates?address=XXXL` Lisk Core API and stored in `delegate_history` table.

`vote_weight` of day `n-1` is computed based on `vote_weight` of day `n` and list of all transactions of that day sorted retrospectivelly.
It should be doing the following for each transaction `tx`:
- if `tx.senderId` is in `voters` list, then `vote_weight += tx.amount + tx.fee` and update `balance` in `account_history` table where `address` = `tx.senderId`
- if `tx.recipientId` is in `voters` list, then `vote_weight -= tx.amount + tx.fee`  and update `balance` in `account_history` table where `address` = `tx.recipientId`
- if the transaction votes for a delegate, then `vote_weight -= balance` where `balance` is from `account_history` table where `address` = `tx.senderId`
- if the transaction unvotes a delegate, then `vote_weight += balance` where `balance` is from `account_history` table where `address` = `tx.senderId`


#### `approval` in `delegate_history` table
`approval` of the current timestamp is obtained as `data[0].approval` from `/api/delegates?address=XXXL` Lisk Core API and stored in `delegate_history` table.

`approval` of day `n-1` is computed based on `voteWeight` and `supply` of day `n-1` as follows: `approval = voteWeight / supply`

#### `supply` in `supply_history` table

`supply` of the current timestamp is obtained as `data.supply` from `/api/node/constants` Lisk Core API

`supply` of day `n-1` is computed based on `supply` of day `n` and the first and last block of that day as follows:
`supply[n-1] = supply[n] - getRewardSum(lastBlock.height, firstBlock.height)`  where `getRewardSum(endHeight, startHeight)` computes sum of rewards between the two given block height, based on the milestones defined in https://github.com/LiskHQ/lisk-sdk/blob/679d52cd5de90f30af28b6ba82f0f150ce8e70b9/protocol-specs/config/devnet.json#L7-L17. 
The rewards are 0 until height `REWARDS.OFFSET`, then changing to the value of `REWARDS.MILESTONES[i]` where `i=0` and after each `REWARDS.DISTANCE` blocks, `i = i+1`, if `i < REWARDS.MILESTONES.length`.
