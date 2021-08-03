# Lisk Service Core

The REST client service acts as a bridge between the Lisk Core and the Lisk Service API. Its main purpose is to provide enriched data from the Lisk Core API. This service is aimed at providing high availability, and both efficient and reliable access to the Lisk Core API.

> Note that this installation instruction is required only for the purpose of development activities. For a regular Lisk Service user, the official [documentation](https://lisk.com/documentation/lisk-service/) is sufficient to run their own instance. The global readme file present in the root directory describes how to run all microservices simultaneously.

## Installation

### Prerequisites

Please refer to the readme file (`README.md`) in the project root directory.

## Installation

Clone the Lisk Service Repository:

```bash
git clone https://github.com/LiskHQ/lisk-service.git # clone repository
cd lisk-service/components/core # move into core component folder
npm install # install required Node.js modules
```

## Configuration

To configure the different components, there are a number of environment variables, the user can define in order to customize the configurations.

A list of the most commonly used environment variables can be seen below:

- `SERVICE_BROKER`: URL of the microservice message broker (Redis)
- `SERVICE_CORE_MYSQL`: URL of the local Lisk Service Core database
- `SERVICE_CORE_REDIS`: URL of Redis server (dedicated for core, different than the message broker)
- `LISK_CORE_WS`: URL of Lisk Core node (WebSocket API)
- `LISK_STATIC`: URL of Lisk static assets
- `GEOIP_JSON`: URL of GeoIP server
- `ENABLE_TRANSACTION_STATS`: Enables global transaction statistics
- `ENABLE_FEE_ESTIMATOR_QUICK`: Enables the fee estimator (quick algorithm)
- `ENABLE_FEE_ESTIMATOR_FULL`: Enables the fee estimator (full blockchain analysis)

The variables listed above can be overridden globally by using global variables.

```bash
export LISK_CORE_WS="http://localhost:8080" # Set Lisk node port to the given URL globally
```

### Example

```bash
# Run a local instance with a local core node, MySQL and Redis
# This also enables the transaction statistics for the previous 40 days
LISK_CORE_WS="ws://localhost:8080" \
SERVICE_CORE_MYSQL="mysql://lisk:password@localhost:3306/lisk" \
SERVICE_CORE_REDIS="redis://localhost:6379/7" \
ENABLE_TRANSACTION_STATS="true" \
TRANSACTION_STATS_HISTORY_LENGTH_DAYS="40" \
node app.js
```

## Management

### Start

```bash
cd lisk-service/components/core # move into root folder of the core component
npm start # start the component with running nodes locally
```

Use the `framework/bin/moleculer_client.js` and `framework/bin/moleculer_subscribe.js` clients to test specific service endpoints.

If you want to run a production variant of the service use `Docker` or `PM2`. In the event whereby the process fails, it will be automatically recovered.

#### Stop

Press `Ctrl+C` in the terminal to stop the process.

## Contributors

https://github.com/LiskHQ/lisk-service/graphs/contributors

## License

Copyright 2016-2019 Lisk Foundation

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
