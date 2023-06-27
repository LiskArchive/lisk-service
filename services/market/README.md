# Lisk Service Market

The Market service allows price data retrieval. It supports multiple sources to keep the current Lisk token price up-to-date and available to the clients in real-time.

> Note that this installation instruction is required only for development activities. For a regular Lisk Service user the official [documentation](https://lisk.com/documentation/lisk-service/) is sufficient to run an instance. The global readme file present in the root directory describes running all the microservices simultaneously.

## Installation

### Prerequisites

Please refer to the [README](../../README.md) in the project root directory.

## Installation

Clone the Lisk Service Repository:

```bash
git clone https://github.com/LiskHQ/lisk-service.git # clone repository
cd lisk-service/services/market # move into market microservice directory
npm ci # install required Node.js dependencies
```

## Configuration

To configure the different microservices, there are several environment variables the user can define to customize the configurations.

A list of the most commonly used environment variables is presented below:

- `SERVICE_BROKER`: URL of the microservice message broker (NATS or Redis).
- `SERVICE_MARKET_REDIS`: URL of the cache storage (Redis).
- `EXCHANGERATESAPI_IO_API_KEY`: Access key to fetch data from the exchangeratesapi.io API.
- `SERVICE_MARKET_FIAT_CURRENCIES`: Supported fiat currencies.
- `SERVICE_MARKET_TARGET_PAIRS`: Supported target pairs.
- `JOB_INTERVAL_REFRESH_PRICES_BINANCE`: Job run interval to refresh prices from Binance. By default, it is set to 0.
- `JOB_SCHEDULE_REFRESH_PRICES_BINANCE`: Job run cron schedule to refresh prices from Binance. By default, it is set to run every minute (`* * * * *`).
- `JOB_INTERVAL_REFRESH_PRICES_BITTREX`: Job run interval to refresh prices from Bittrex. By default, it is set to 0.
- `JOB_SCHEDULE_REFRESH_PRICES_BITTREX`: Job run cron schedule to refresh prices from Bittrex. By default, it is set to run every minute (`* * * * *`).
- `JOB_INTERVAL_REFRESH_PRICES_EXCHANGERATESAPI`: Job run interval to refresh prices from exchangeratesapi. By default, it is set to 0.
- `JOB_SCHEDULE_REFRESH_PRICES_EXCHANGERATESAPI`: Job run cron schedule to refresh prices from exchangeratesapi. By default, it is set to run every minute (`* * * * *`).
- `JOB_INTERVAL_REFRESH_PRICES_KRAKEN`: Job run interval to refresh prices from Kraken. By default, it is set to 0.
- `JOB_SCHEDULE_REFRESH_PRICES_KRAKEN`: Job run cron schedule to refresh prices from Kraken. By default, it is set to run every minute (`* * * * *`).
- `JOB_INTERVAL_UPDATE_PRICES`: Job run interval to update market prices. By default, it is set to run every 5 seconds.
- `JOB_SCHEDULE_UPDATE_PRICES`: Job run cron schedule to update market prices. By default, it is set to ''.

> **Note**: `interval` takes priority over `schedule` and must be greater than 0 to be valid for all the moleculer job configurations.

## Management

### Start

```bash
cd lisk-service/services/market # move into the root directory of the market microservice
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
