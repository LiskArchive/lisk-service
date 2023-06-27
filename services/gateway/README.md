# Lisk Service Gateway

The Gateway service provides the API, which all users of Lisk Service can access and use. Its main purpose is to proxy the API requests from users to other services provided by Lisk Service. This provides the users with a central point of data access that never disrupts or breaks the existing application compatibility.

> Note that this installation instruction is required only for development activities. For a regular Lisk Service user, the official [documentation](https://lisk.com/documentation/lisk-service/) is sufficient to run an instance. The global readme file present in the root directory describes how to run all the microservices simultaneously.

## Installation

### Prerequisites

Please refer to the [README](../../README.md) in the project root directory.

## Installation

Clone the Lisk Service Repository:

```bash
git clone https://github.com/LiskHQ/lisk-service.git # clone repository
cd lisk-service/services/gateway # move into gateway microservice directory
npm ci # install required Node.js dependencies
```

## Configuration

To configure the different microservices, there are a number of environment variables the user can define in order to customize the configurations.

A list of the most commonly used environment variables is presented below:

- `SERVICE_BROKER`: URL of the microservice message broker (NATS or Redis).
- `JSON_RPC_STRICT_MODE`: Makes JSON-RPC require a valid JSON-RPC 2.0 envelope.
- `ENABLE_HTTP_API`: Enables particular HTTP APIs listed by a comma.
- `ENABLE_WS_API`: Enables particular JSON-RPC APIs listed by a comma.
- `CORS_ALLOWED_ORIGIN`: Allows request from the comma separated string of origins. By default, it is set to `*` which allows request from all origins.
- `SERVICE_GATEWAY_REDIS_VOLATILE`: URL of the volatile cache storage (Redis).
- `HTTP_RATE_LIMIT_ENABLE`: Boolean flag to enable HTTP rate limiter. Disabled by default. To enable, set it to `true`.
- `HTTP_RATE_LIMIT_WINDOW`: To keep a record of requests in the memory (in seconds). By default, it is set to 10 seconds.
- `HTTP_RATE_LIMIT_CONNECTIONS`: Maximum number of allowed requests for a specified window, configured by `HTTP_RATE_LIMIT_WINDOW`.
- `ENABLE_HTTP_CACHE_CONTROL`: Boolean flag to enable HTTP response caching. This includes the `Cache-Control` header within the responses.
- `HTTP_CACHE_CONTROL_DIRECTIVES`: HTTP `cache-control` directives.
- `WS_RATE_LIMIT_ENABLE`: Boolean flag to enable WS rate limiter.
- `WS_RATE_LIMIT_CONNECTIONS`:  Maximum number of new connections allowed within a configured window, specified by `WS_RATE_LIMIT_DURATION`.
- `WS_RATE_LIMIT_DURATION`: Rate limit window in seconds.
- `ENABLE_REQUEST_CACHING`: Boolean flag to enable RPC response caching.
- `GATEWAY_DEPENDENCIES`: Services on which the gateway is dependent (can be expressed as a CSV).
- `JOB_INTERVAL_UPDATE_READINESS_STATUS`: Job run interval to update the readiness status. By default, it is set to 0.
- `JOB_SCHEDULE_UPDATE_READINESS_STATUS`: Job run cron schedule to update the readiness status. By default, it is set to run every minute (`* * * * *`).

> **Note**: `interval` takes priority over `schedule` and must be greater than 0 to be valid for all the moleculer job configurations.

The variables listed above can be universally overridden by using global variables.

```bash
export ENABLE_HTTP_API="http-status,http-version3"
```

### Examples

```bash
# Run local instance with HTTP API only
ENABLE_HTTP_API="http-status,http-version3" \
ENABLE_WS_API="" \
CORS_ALLOWED_ORIGIN="https://www.host1.com,https://www.host2.com" \
node app.js
```

```bash
# Run a local instance with the RPC API in a strict mode and using HTTP
ENABLE_HTTP_API="http-status,http-version3" \
ENABLE_WS_API="blockchain,rpc-v3" \
CORS_ALLOWED_ORIGIN="https://www.host1.com,https://www.host2.com" \
JSON_RPC_STRICT_MODE="true" \
node app.js
```

## Management

### Start

```bash
cd lisk-service/services/gateway # navigate into the root directory of the gateway microservice
npm start # start the microservice with running nodes locally
```

Use the `framework/bin/moleculer_client.js` and `framework/bin/moleculer_subscribe.js` clients to test particular service endpoints.

If you want to run a production variant of the service use `Docker` or `PM2`. In the event whereby the process fails, it will be automatically recovered.

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
