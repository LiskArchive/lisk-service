# Lisk Service Blockchain Application Registry

The Blockchain Application Registry service is responsible to serve the off-chain application metadata from the [Lisk Application Registry](https://github.com/LiskHQ/app-registry) via an API.

> Note that this installation instruction is required only for development activities. For a regular Lisk Service user, the official [documentation](https://lisk.com/documentation/lisk-service/) is sufficient to run their instance. The global readme file present in the root directory describes how to run all microservices simultaneously.

## Installation

### Prerequisites

Please refer to the [README](../../README.md) in the project root directory.

## Installation

Clone the Lisk Service Repository:

```bash
git clone https://github.com/LiskHQ/lisk-service.git # clone repository
cd lisk-service/services/blockchain-app-registry # move into blockchain-app-registry microservice directory
npm install # install required Node.js dependencies
```

## Configuration

To configure the different microservices, there are several environment variables, the user can define to customize the configurations. 

A list of the most commonly used environment variables is presented below:

- `SERVICE_BROKER`: URL of the microservice message broker (NATS or Redis)
- `SERVICE_APP_REGISTRY_MYSQL`: Connection string of the MySQL instance that the microservice connects to
- `ENABLE_REBUILD_INDEX_AT_INIT`: Boolean flag to truncate the index and rebuild at application init

## Management

### Start

```bash
cd lisk-service/services/blockchain-app-registry # move into the root directory of the blockchain-app-registry microservice
npm start # start the microservice
```

Use the `framework/bin/moleculer_client.js` and `framework/bin/moleculer_subscribe.js` clients to test specific service endpoints.

Once the process is verified as running correctly, `CTRL+C` and start the process with `PM2`. This will fork the process into the background and automatically recover the process if it fails.

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
