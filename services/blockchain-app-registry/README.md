# Lisk Service Template

The Template service is an abstract service that all of Lisk Service services are inherited from. It allows all services to share a similar interface and design pattern. Its purpose is to reduce code duplication and increase consistency between each service, hence simplifying code maintenance and testing.

> Note that this installation instruction is required only for the purpose of development activities. For a regular Lisk Service user, the official [documentation](https://lisk.com/documentation/lisk-service/) is sufficient to run their own instance. The global readme file present in the root directory describes how to run all microservices simultaneously.

## Installation

### Prerequisites

Please refer to the readme file (`README.md`) in the project root directory.

## Installation

Clone the Lisk Service Repository:

```bash
git clone https://github.com/LiskHQ/lisk-service.git # clone repository
cd lisk-service/services/template # move into template microservice directory
npm install # install required Node.js dependencies
```

## Configuration

To configure the different microservices, there are a number of environment variables, the user can define in order to customize the configurations. The template service does not use any of them by default.

## Management

### Start

```bash
cd lisk-service/services/template # move into root directory of the template microservice
npm start # start the microservice
```

Use the `framework/bin/moleculer_client.js` and `framework/bin/moleculer_subscribe.js` clients to test specific service endpoints.

Once the process is verified as running correctly, `CTRL+C` and start the process with `PM2`. This will fork the process into the background and automatically recover the process if it fails.

#### Stop Lisk Service

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
