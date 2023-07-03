# Lisk Service Blockchain Application Registry

The Blockchain Application Registry service is responsible to serve the off-chain application metadata from the [Lisk Application Registry](https://github.com/LiskHQ/app-registry) via an API.

> Note that this installation instruction is required only for development activities. For a regular Lisk Service user, the official [documentation](https://lisk.com/documentation/lisk-service/) is sufficient to run an instance. The global readme file present in the root directory describes how to run all the microservices simultaneously.

## Installation

### Prerequisites

Please refer to the [README](../../README.md) in the project root directory.

## Installation

Clone the Lisk Service Repository:

```bash
git clone https://github.com/LiskHQ/lisk-service.git # clone repository
cd lisk-service/services/blockchain-app-registry # move into blockchain-app-registry microservice directory
npm ci # install required Node.js dependencies
```

## Configuration

To configure the different microservices, there are several environment variables the user can define to customize the configurations. 

A list of the most commonly used environment variables is presented below:

- `SERVICE_BROKER`: URL of the microservice message broker (NATS or Redis).
- `SERVICE_APP_REGISTRY_MYSQL`: Connection string of the MySQL instance that the microservice connects to.
- `ENABLE_REBUILD_INDEX_AT_INIT`: Boolean flag to truncate the index and rebuild at application init.
- `DEFAULT_APPS`: Default blockchain applications. By default it is set to `Lisk`
- `JOB_INTERVAL_DELETE_NON_METADATA_FILES`: Job run interval to delete non-metadata files. By default, it is set to 0.
- `JOB_SCHEDULE_DELETE_NON_METADATA_FILES`: Job run cron schedule to delete non-metadata files. By default, it is set to run every day at midnight (`0 0 * * *`).
- `JOB_INTERVAL_UPDATE_METADATA`: Job run interval to update off-chain metadata. By default, it is set to 0.
- `JOB_SCHEDULE_UPDATE_METADATA`: Job run cron schedule to update off-chain metadata. By default, it is set to run every 10 minutes (`*/10 * * * *`).

> **Note**: `interval` takes priority over `schedule` and must be greater than 0 to be valid for all the moleculer job configurations.

## Management

### Start

```bash
cd lisk-service/services/blockchain-app-registry # move into the root directory of the blockchain-app-registry microservice
npm start # start the microservice
```

Use the `framework/bin/moleculer_client.js` and `framework/bin/moleculer_subscribe.js` clients to test specific service endpoints.

Once the process is verified as running correctly, press `CTRL+C` and start the process with `PM2`. This will fork the process into the background and automatically recover the process if it fails.

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
