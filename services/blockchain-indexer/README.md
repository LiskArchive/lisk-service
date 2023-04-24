# Lisk Service Blockchain Indexer

The Blockchain Indexer service, in the *indexing* mode, is primarily responsible to update the index, based on the scheduled jobs by the Blockchain Coordinator. In the *data service* mode, it serves user request queries made via the RESTful API or WebSocket-based RPC calls. It can run both the indexer and data service modes simultaneously, enabled by default.

<!-- It is primarily responsible to index all the blockchain information and encapsulate majority of the business logic for the Lisk Service API. -->

> Note that this installation instruction is required only for development activities. For a regular Lisk Service user the official [documentation](https://lisk.com/documentation/lisk-service/) is sufficient to run their instance. The global readme file present in the root directory describes running all microservices at once.

## Installation

### Prerequisites

Please refer to the [README](../../README.md) in the project root directory.

## Installation

Clone the Lisk Service Repository:

```bash
git clone https://github.com/LiskHQ/lisk-service.git # clone repository
cd lisk-service/services/blockchain-indexer # move into blockchain-indexer microservice directory
npm install # install required Node.js dependencies
```

## Configuration

To configure the different microservices, there are several environment variables, the user can define to customize the configurations.

A list of the most commonly used environment variables is presented below:

- `SERVICE_BROKER`: URL of the microservice message broker (Redis)
- `SERVICE_INDEXER_MYSQL`: Connection string of the MySQL instance that the microservice connects to
- `SERVICE_MESSAGE_QUEUE_REDIS`: URL of the job queue to process the scheduled indexing jobs by the Blockchain Coordinator (Redis)
- `SERVICE_INDEXER_REDIS_VOLATILE`: URL of the volatile cache storage (Redis)
- `ENABLE_DATA_RETRIEVAL_MODE`: Boolean flag to enable the Data Service mode
- `ENABLE_INDEXING_MODE`: Boolean flag to enable the Data Indexing mode
- `ENABLE_PERSIST_EVENTS`: Boolean flag to permanently persist the events in the MySQL database

## Management

### Start

```bash
cd lisk-service/services/blockchain-indexer # move into the root directory of the blockchain-indexer microservice
npm start # start the microservice with running nodes locally
```

Use the `framework/bin/moleculer_client.js` and `framework/bin/moleculer_subscribe.js` clients to test particular service endpoints.

If you want to run a production variant of the service, use `Docker` or `PM2`. This will automatically recover the process when it fails.

### Stop

Press `Ctrl+C` in the terminal to stop the process.

## Contributors

https://github.com/LiskHQ/lisk-service/graphs/contributors

## License

Copyright 2016-2023 Lisk Foundation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

[lisk documentation site]: https://lisk.com/documentation
