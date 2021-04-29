# Lisk Service Market

## Installation

### Prerequisites

- [Linux Prerequisites](docs/prerequisites-linux.md)
- [MacOS Prerequisites](docs/prerequisites-macos.md)

## Installation

Clone the Lisk Service Repository:

```bash
git clone https://github.com/LiskHQ/lisk-service.git # clone repository
cd lisk-service/services/market # move into market component folder
npm install # install required Node.js modules
```

## Configuration

To configure the different components, there are a number of environment variables, the user can define in order to customize the configurations. The market service does not use any of them by default.

## Management

### Start

```bash
cd lisk-service/services/gateway # move into root folder of the market component
npm start # start the component
 ```

Use the `utils/moleculer_client.js` to connect with the NATS-enabled micro-service.

Once the process is verified as running correctly, `CTRL+C` and start the process with `PM2`. This will fork the process into the background and automatically recover the process if it fails.

#### Stop Lisk Service

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
