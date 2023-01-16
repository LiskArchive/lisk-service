# Lisk Service App Framework

Lisk Service Framework is made for quick development of Micoservice-based applications with minimal requirements.

It has the following features built-in:
- Microservice framework based on Moleculer
- Logger with GELF support
- HTTP library with LRU cache
- WebSocket Client

All modules can be easily replaced by other libraries when needed.

## Installation

```
npm install lisk-service-framework
```

## Quick Start

Following example works with Redis as a service broker.
Alternatively NATS can be used.

```javascript
// app.js - main application loader
const { Microservice, LoggerConfig, Logger } = require('lisk-service-framework');

// Configure logger
LoggerConfig({
	level: 'info',
	stdout: 'true',
	name: 'test-microservice',
	version: '1.0.0',
});

const logger = Logger('test-microservice');

// Initialize Microservice framework
const app = Microservice({
	name: 'test',
	transporter: 'redis://localhost:6379',
	logger: Logger('test-moleculer'),
});

// Add route
app.addMethod({
	name: 'hello',
	description: 'Hello method',
	controller: async () => ({
		data: { message: 'Hello World!' }
	}),
});

// Run the application
app.run().then(() => {
	logger.info(`Service started`);
}).catch((err) => { logger.fatal(err.stack) });
```

Browse the Lisk Service Template repo for more examples.

## Docs

_[Coming soon]_

## Tests

_[Coming soon]_

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
