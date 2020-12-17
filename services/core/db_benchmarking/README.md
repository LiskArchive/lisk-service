# Lisk Service DB Benchmarking

The proof-of-concept (PoC) was used to run tests to determine the batch insert performance of the various databases with varying batch sizes.

The databases under trial included:
  - Redis
  - SQLite
  - MySQL

However, the PoC currently only runs the tests for Redis and MySQL.

## Instructions

  1. Generate the test dataset: `node generateTestData.js`
  2. Run the tests: `node benchmark.js`
  3. On successful completion, the test results are saved to the `results` directory
  4. The batch size can be configured by updating the `batchSize` variable in both `generateTestData.js` and `benchmark.js`

## Assumptions

  - Redis server is available on `localhost:6379`
  - MySQL server is available on `localhost:3306`
