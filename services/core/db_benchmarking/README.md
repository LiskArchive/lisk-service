# Lisk Service DB Benchmarking

The proof-of-concept (PoC) was used to run tests to determine the batch insert performance of the various databases with varying batch sizes.

The databases under trial were:
  - Redis
  - SQLite
  - MySQL

However, the PoC currently only runs the tests for Redis and MySQL.

## Instructions

  1. Generate the test dataset: `node generateTestData.js`
  2. Run the tests: `node benchmark.js`
  3. On successful completion, the test results are saved to the `results` directory
  4. The batch size can be configured by updating the `batchSize` variable in both `generateTestData.js` and `benchmark.js`

### Script usage:

__Test data generation__:
```
  node generateTestData.js
  node generateTestData.js 1000
  node generateTestData.js 1000,5000,10000
```
__Test execution__:
```
  node benchmark.js
  node benchmark.js 1000
  node benchmark.js 1000,5000,10000
```
### Notes:

  - The data generator generates a total of 1 million user records and 12 million (approx.) transactions
  - The default batch size is 10000 for users and 122000 (approx.) for transactions
  - The scripts accept batch sizes as command line inputs. Multiple batch sizes can be specified as comma separated values (check [Script usage](#script-usage))
  - Please generate the test data before running the tests for the desired batch sizes

## Assumptions

  - Redis server is available on `localhost:6379`
  - MySQL server is available on `localhost:3306`
