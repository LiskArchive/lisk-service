# Lisk Service Blockchain Connector

The Blockchain Connector service is the only microservice that connects directly with the Lisk SDK-based application node. It is responsible to reduce the number of calls to the node ensuring high availability and offering both efficient and reliable access to the application node's API. It also automatically decodes all the necessary information (e.g. event data), for a more enhanced user experience.

> Note that this installation instruction is required only for development activities. For a regular Lisk Service user, the official [documentation](https://lisk.com/documentation/lisk-service/) is sufficient to run an instance. The global readme file present in the root directory describes how to run all the microservices simultaneously.

## Installation

### Prerequisites

Please refer to the [README](../../README.md) in the project root directory.

## Installation

Clone the Lisk Service Repository:

```bash
git clone https://github.com/LiskHQ/lisk-service.git # clone repository
cd lisk-service/services/blockchain-connector # move into blockchain-connector microservice directory
yarn install --frozen-lockfile # install required Node.js dependencies
```

## Configuration

To configure the different microservices, there are several environment variables the user can define to customize the configurations.

A list of the most commonly used environment variables is presented below:

- `SERVICE_BROKER`: URL of the microservice message broker (NATS or Redis).
- `LISK_APP_WS`: URL to connect with the Lisk SDK-based application node over WebSocket. By default, it is set to `ws://127.0.0.1:7887`.
- `LISK_APP_HTTP`: URL to connect with the Lisk SDK-based application node over HTTP(s). By default, it is set to `http://127.0.0.1:7887`.
- `USE_LISK_HTTP_API`: Boolean flag to enable HTTP-API based connection to the Lisk SDK-based application node.
- `USE_LISK_IPC_CLIENT`: Boolean flag to enable IPC-based connection to the Lisk SDK-based application node. Not applicable to a docker-based setup.
- `LISK_APP_DATA_PATH`: Data path to connect with the Lisk SDK-based application node over IPC. Not applicable to a docker-based setup.
- `GENESIS_BLOCK_URL`: URL of the Lisk SDK-based application' genesis block. Only to be used when the genesis block is large enough to be transmitted over API calls within the timeout.
- `GEOIP_JSON`: URL of GeoIP server.
- `ENABLE_BLOCK_CACHING`: Boolean flag to enable the block caching. Enabled by default. To disable, set it to `false`.
- `EXPIRY_IN_HOURS`: Expiry time (in hours) for block cache. By default, it is set to `12`.
- `CLIENT_POOL_SIZE`: Number of active API clients to be maintained in the pool. Only applicable when using the IPC or WS clients to connect with the Lisk node. By default, it is set to `10`.
- `WS_SERVER_PING_INTERVAL`: Interval (in milliseconds) at which the WS server checks for liveliness of all the connected clients. This should not be modified unless explicitly recommended by the development team. By default, it is set to `3000`.
- `WS_SERVER_PING_INTERVAL_BUFFER`: A conservative assumption of the latency (in milliseconds) for WS server pings to arrive at the client. By default, it is set to `1000`.
- `ENDPOINT_INVOKE_MAX_RETRIES`: Maximum number of endpoint invocation request retries to the node. By default, it is set to `3`.
- `ENDPOINT_INVOKE_RETRY_DELAY`: Delay (in milliseconds) between each endpoint invocation request retry. By default, it is set to `50`.
- `CONNECTOR_EXIT_DELAY_IN_HOURS`: Delay (in hours) after which the blockchain-connector microservice exits. The service should restart automatically if deployed using Docker or PM2. To be removed eventually. To enable it, set it higher than `0`. By default, it is set to `0`.
- `JOB_INTERVAL_CACHE_CLEANUP`: Job run interval to cleanup block cache. By default, it is set to `0`.
- `JOB_SCHEDULE_CACHE_CLEANUP`: Job run cron schedule to cleanup block cache. By default, it is set to run every 12 hours (`0 */12 * * *`).
- `JOB_INTERVAL_REFRESH_PEERS`: Job run interval to refresh the peers list. By default, it is set to run every `60` seconds.
- `JOB_SCHEDULE_REFRESH_PEERS`: Job run cron schedule to refresh the peers list. By default, it is set to `''`.

> **Note**: `interval` takes priority over `schedule` and must be greater than 0 to be valid for all the moleculer job configurations.

The variables listed above can be universally overridden by using global variables.

```bash
export LISK_APP_WS="ws://127.0.0.1:7887" # Globally set Lisk application node URL
export LISK_APP_WS="ws://host.docker.internal:7887" # When running a docker-based setup
```

### Example

```bash
# Run a local instance against a local Lisk application node
LISK_APP_WS="ws://127.0.0.1:7887" \
node app.js
```

## Management

### Start

```bash
cd lisk-service/services/blockchain-connector # move into the root directory of the blockchain-connector microservice
yarn start # start the microservice with running nodes locally
```

Use the `framework/bin/moleculer_client.js` and `framework/bin/moleculer_subscribe.js` clients to test specific service endpoints.

If you want to run a production variant of the service, use `Docker` or `PM2`. In the event whereby the process fails, it will be automatically recovered.

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
