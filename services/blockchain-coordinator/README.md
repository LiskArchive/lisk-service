# Lisk Service Blockchain Coordinator

The Blockchain Coordinator service is primarily responsible to verify the index readiness. It regularly monitors the index completion status and schedules jobs to index the missing or newly generated blocks as soon as they're available.

> Note that this installation instruction is required only for development activities. For a regular Lisk Service user the official [documentation](https://lisk.com/documentation/lisk-service/) is sufficient to run an instance. The global readme file present in the root directory covers running all the microservices simultaneously.

## Installation

### Prerequisites

Please refer to the [README](../../README.md) in the project root directory.

## Installation

Clone the Lisk Service Repository:

```bash
git clone https://github.com/LiskHQ/lisk-service.git # clone repository
cd lisk-service/services/blockchain-coordinator # move into blockchain-coordinator microservice directory
npm ci # install required Node.js dependencies
```

## Configuration

To configure the different microservices, there are several environment variables the user can define to customize the configurations.

A list of the most commonly used environment variables is presented below:

- `SERVICE_BROKER`: URL of the microservice message broker (NATS or Redis).
- `SERVICE_MESSAGE_QUEUE_REDIS`: URL of the job queue to schedule the indexing jobs (Redis).
- `JOB_INTERVAL_INDEX_MISSING_BLOCKS`: Job run interval to index missing blocks. By default, it is set to 0.
- `JOB_SCHEDULE_INDEX_MISSING_BLOCKS`: Job run cron schedule to index missing blocks. By default, it is set to run every 15 minutes (`*/15 * * * *`).

> **Note**: `interval` takes priority over `schedule` and must be greater than 0 to be valid for all the moleculer job configurations.

## Management

### Start

```bash
cd lisk-service/services/blockchain-coordinator # move into the root directory of the blockchain-coordinator microservice
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
