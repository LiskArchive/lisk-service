# Build Lisk Service from Source

Building and running Lisk Service from source is an alternative way to run it on the server or development environment. This technique is useful on systems whereby there is no possibility of using Docker, and also for development purposes.

## Prerequisites

In order to run a local version of Lisk Service, the following development dependencies listed below have to be installed:

- [Ubuntu 18.04 LTS Bionic Beaver Development Dependencies](./prerequisites_development_ubuntu.md)
- [Ubuntu 20.04 LTS Focal Fossa Development Dependencies](./prerequisites_development_ubuntu.md)
- [Debian 10 Buster Development Dependencies](./prerequisites_development_debian.md)
- [MacOS 10.15 Catalina Development Dependencies](./prerequisites_development_macos.md)

## Get sources with version control

Instead of getting the tar.gz archive with the previous version as described in the main README, clone the entire repository with the git version control system.

```bash
# Clone Lisk Service repository
git clone https://github.com/LiskHQ/lisk-service.git

# Change directory to the new repository
cd lisk-service

# Switch to the recent stable as a base
git checkout vx.y.z

# ...or use the development branch
git checkout development
```

Where `x.y.z` is the latest release version, ex. 1.0.1


## Installation

Install all yarn dependencies from the root directory.

```bash
npm i -g yarn
make build-local
```

## Configuration

The `ecosystem.mainnet.config.js` contains a sample configuration, which refers to the mainnet. Please ensure it reflects your local environment. All configuration parameters are described in the document [Configuration Options](./config_options.md).

## Managing Lisk Service

### Start Lisk Service

```bash
pm2 start ecosystem.config.js

# or

yarn start
```

To check the service status, navigate to the URL <http://127.0.0.1:9901/api/status>. If it is running on a remote system, change the host IP from `127.0.0.1` to the external IP address of your machine.

### Lisk Service Status

After starting the process, the runtime status and log location can be found by executing the following command:
```bash
pm2 list
```

### Stop Lisk Service

```bash
pm2 stop ecosystem.config.js
```

### Restart Lisk Service

Restart all microservices of Lisk Service simultaneously.

```bash
pm2 restart ecosystem.config.js
```

### Remove all processes from PM2 list

```bash
pm2 delete ecosystem.config.js

# or

yarn stop
```

### Clean all run-time files with dependencies

```bash
make clean
```

## Running tests

Once the application is running it is now possible to run automated tests.

### Unit tests 

Unit tests are implemented in the framework and every microservice of the project. They are designed to test the most fundamental, product-independent logic that is used to build a micro-service on top of the framework.

```bash
cd framework
yarn run test:unit

cd ../services/blockchain-app-registry
yarn run test:unit

cd ../services/blockchain-connector
yarn run test:unit

cd ../services/blockchain-indexer
yarn run test:unit

cd ../services/fee-estimator
yarn run test:unit

cd ../services/market
yarn run test:unit

cd ../services/export
yarn run test:unit

cd ../services/gateway
yarn run test:unit
```

### Functional tests

Functional tests ensure that a project build on the top of the framework is able to process requests and collect responses involving the API gateway.

```bash
cd framework
yarn run test:functional

cd ../services/blockchain-app-registry
yarn run test:functional

cd ../services/blockchain-connector
yarn run test:functional

cd ../services/blockchain-indexer
yarn run test:functional

cd ../services/fee-estimator
yarn run test:functional

cd ../services/market
yarn run test:functional

cd ../services/export
yarn run test:functional

cd ../services/gateway
yarn run test:functional
```

### Integration tests

Integration tests work in a similar manner to functional tests. In this case the real blockchain data coming from a custom test blockchain is used. Please ensure that Lisk Core and all microservices are running.

To run Lisk Core with a custom blockchain:
```bash
cd jenkins/lisk-core
make up
```

To run Lisk Service with PM2
```bash
pm2 start ecosystem.config.js
```

To run the integration tests:
```bash
cd tests
yarn run test
```

## Next steps

It is now possible to use your preferred editor to make changes in the source files. Take a look at the [template](../services/template) project in order to find some suitable examples.

Once completed, it is also possible to build Docker images with `make build-images` and run them using the method from the main [README](../README.md).
