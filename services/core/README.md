# Lisk Service Core

The REST client component acts as a bridge between the Lisk Core and the Lisk Service API.
Its main purpose is to provide enriched data from the Lisk Core API.
This component is aimed at providing high availability, efficient and reliable access to the Lisk Core API. 

## Installation

### Prerequisites

- [Linux Prerequisites](docs/prerequisites-linux.md)
- [MacOS Prerequisites](docs/prerequisites-macos.md)

## Installation

Clone the Lisk Service Repository:

```bash
git clone https://github.com/LiskHQ/lisk-service.git # clone repository
cd lisk-service/components/core # move into core component folder
npm install # install required Node.js modules
```

## Configuration

To configure the different components, there are a number of environment variables, the user can define in order to customize the configurations.

List of the most commonly used environment variables:

- `SERVICE_NATS`: URL of the micro-service message broker (NATS)
- `SERVICE_CORE_POSTGRES`: URL of the local Lisk Service Core database
- `SERVICE_CORE_REDIS`: URL of Redis server
- `LISK_CORE_HTTP`: URL of Lisk Core node (HTTP API).
- `LISK_CORE_WS`: URL of Lisk Core node (WebSocket API),
- `LISK_STATIC`: URL of Lisk static assets
- `GEOIP_JSON`: URL of GeoIP server

The variables listed above can be overridden globally by using global variables.

```bash
export LISK_CORE_HTTP="http://localhost:4000" # Set Lisk node port to the given URL globally
```

## Management

### Start

```bash
cd lisk-service/components/core # move into root folder of the core component
npm start # start the component with running nodes locally
npm run start:local # start the component with running nodes locally
npm run start:testnet # start the component with running nodes on testnet
npm run start:mainnet # start the component with running nodes on mainnet
 ```

Use the `utils/moleculer_client.js` and `utils/moleculer_subscribe.js` clients to test particular service endpoints.

If you want to run a production variant of the service use `Docker` or `PM2`. This will automatically recover the process if it fails.

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

[lisk documentation site]: https://lisk.io/documentation