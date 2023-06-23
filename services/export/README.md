# Lisk Service Export

The Export service allows users to download the transaction history for a specified user address or publicKey, in a CSV format to aid the auditors.

## Installation

### Prerequisites

Please refer to the [README](../../README.md) in the project root directory.

## Installation

Clone the Lisk Service Repository:

```bash
git clone https://github.com/LiskHQ/lisk-service.git # clone repository
cd lisk-service/services/export # move into export microservice directory
npm ci # install required Node.js dependencies
```

## Configuration

To configure the different microservices, there are several environment variables the user can define to customize the configurations.

> Note: Interval takes priority over schedule and must be greater than 0 to be valid for all moleculer job configurations.

A list of the most commonly used environment variables is presented below:

- `SERVICE_BROKER`: URL of the microservice message broker (NATS or Redis).
- `SERVICE_EXPORT_REDIS`: URL of the permanent cache storage (Redis).
- `SERVICE_EXPORT_REDIS_VOLATILE`: URL of the volatile cache storage (Redis).
- `CACHE_PURGE_INTERVAL`: Job interval to cleanup cache. By default it is set to 0.
- `CACHE_PURGE_SCHEDULE`: Job schedule to cleanup cache. By default it is set to run once a day at 4:45.
- `EXPORT_S3_ENDPOINT`: URL of the permanent cache storage (Redis).
- `EXPORT_S3_ACCESS_KEY`: Access key for amazon S3 bucket.
- `EXPORT_S3_SECRET_KEY`: Secret key for amazon S3 bucket.
- `EXPORT_S3_SESSION_TOKEN`: Session token for amazon S3 bucket.
- `EXPORT_S3_REGION`: Region where amazon S3 bucket is hosted.
- `EXPORT_S3_BUCKET_NAME`: Amazon S3 bucket name.

## Management

### Start

```bash
cd lisk-service/services/export # move into the root directory of the export microservice
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
