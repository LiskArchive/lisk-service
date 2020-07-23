![Logo](./docs/assets/banner_service.png)

# Lisk Service

Lisk Service is a web application that allows interaction with various blockchain networks based on Lisk and Bitcoin protocols.

The main focus of Lisk Service is to provide data to the UI clients such as Lisk Desktop and Lisk Mobile. Lisk Service makes it possible to access all blockchain live data in a similar way to the regular Lisk SDK API, and in addition provides users with much more details and endpoints, such as geolocation and various statistics about network usage.

The project implementation is based on Microservices. The technical stack is designed to deliver several micro-services, and each of them provides one particular functionality. The data is served in JSON format and exposed by a public RESTful API.
## Available Services

Lisk Service consists of several separate modules, that can be run independently from the others. Gateway is required to expose the APIs provided by particular services.

Each service is an independent part of the repository and is placed in a separate directory in the `./services/` directory. Each of them contains its own `package.json` and `Dockerfile` that are needed to run the module.


| Service                  | Description                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [Gateway](services/gateway) | The Gateway service provides the API, which all users of Lisk Service can access and use. Its main purpose is to proxy API requests from users to other services provided by Lisk Service. This provides users with a central point of data access that never breaks existing application compatibility.|
| [Lisk](services/core) | The REST client service acts as a bridge between the Lisk Core and the Lisk Service API. Its main purpose is to provide enriched data from the Lisk Core API. This service is aimed at providing high availability, and both efficient and reliable access to the Lisk Core API. |
| Bitcoin _(planned)_ | The Bitcoin service communicates with [ElectrumX](https://electrumx.readthedocs.io/en/latest/) to retrieve data from the Bitcoin network. The Bitcoin service provides Bitcoin data from the Electrum server and acts as a bridge for the Lisk Service API. |
| [Template](services/template) | The Template service is an abstract service that all of Lisk Service services are inherited from. It allows all services to share a similar interface and design pattern. Its purpose is to reduce code duplication and increase consistency between each service, hence simplifying code maintenance and testing. |

**Remarks**

- Lisk Service is configured to connect [Lisk mainnet network](https://explorer.lisk.io/) by default.
- The default installation method is based on Docker.

## API documentation

The Gateway service provides the following APIs, which all users of Lisk Service can access and use.

| API                      | Description                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| [HTTP API](https://app.swaggerhub.com/apis/LiskHQ/lisk-service-api/1.0#/)     | HTTP API is the public RESTful API that provides blockchain data in standardized JSON format.   |
| [WebSocket JSON-RPC API](docs/api/websocket_json_rpc_api.md)     | The WebSocket-based JSON-RPC API provides blockchain data in standardized JSON format. The API uses the socket.io library and it is compatible with JSON-RPC 2.0 standard.   |
| [Subscribe API](docs/api/websocket_subscribe_api.md)     | The Subscribe API is an event-driven API. It uses a two-way streaming connection, which can notify the client about new data instantly as it arrives. It is responsible for updating users regarding changes in the blockchain network and markets.   |

## Installation

The default port for REST API requests and Socket.io-based communication is `9901`, it is possible to access it through the URL http://localhost:9901/. The REST API can be accessed by any HTTP client such as [Postman](https://www.postman.com/), [cURL](https://curl.haxx.se/) and [HTTPie](https://httpie.org/).
 
WebSocket-based APIs can by used through a [socket.io](https://socket.io/) library available for many modern programming languages and frameworks.

To continue the installation ensure that you have the following dependencies installed:
- [Docker](https://www.docker.com/) with [Docker compose](https://docs.docker.com/compose/install/)
- [GNU Make](https://www.gnu.org/software/make/) and [GNU Tar](https://www.gnu.org/software/tar/)

Follow the instructions listed below, in order to acquire detailed information regarding the installation of required dependencies for various operating systems.

- [Ubuntu 18.04 LTS Bionic Beaver](./docs/prerequisites_docker_ubuntu.md)
- [Ubuntu 20.04 LTS Focal Fossa](./docs/prerequisites_docker_ubuntu.md)
- [Debian 10 Buster](./docs/prerequisites_docker_debian.md)
- [MacOS 10.15 Catalina](./docs/prerequisites_docker_macos.md)

Retrieve the latest release from [the official repository](https://github.com/LiskHQ/lisk-service/releases).

Unpack the source code archive by executing the following commands listed below:

```bash
tar xf lisk-service-x.y.z.tar.gz
cd lisk-service
```

> Although the above commands retrieve the entire source code, this instruction does not mention building a custom version of Lisk Service. For more information refer to this document: [Building Lisk Service from source](./docs/build_from_source.md)

### Docker image build (Optional) 

If you wish to build the local version of Lisk Service execute the following command below.

```bash
make build
```

> This step is only necessary if you wish to build a custom or pre-release version that does not have a pre-built  Docker image in the Docker Hub. The installation script chooses the last available stable version on Docker Hub, **unless** there is no local image. If you are unsure about any local builds, use `make clean` command to remove all locally built docker images.

## Configuration

The default configuration is sufficient to run Lisk Service against the [mainnet network](https://explorer.lisk.io/).

Configuration options are described [in this document](./docs/config_options.md).

> Optional: Check your configuration with the command `make print-config`

## Management

To run the application execute the following command:

```bash
make up
```

To stop the application execute the following command:

```bash
make down
```

## Further development

The possibility to customize and build Lisk Service from a local source is described in the following document [Building Lisk Service from source](./docs/build_from_source.md). This may also be also useful for PM2-based installations.

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
