# Lisk Service with PM2

## Prerequisites

In order to run a local version of Lisk Service, the following development dependencies have to be installed.

- [Ubuntu 18.04 LTS Bionic Beaver Development Dependencies](./prerequisites_development_ubuntu.md)
- [Ubuntu 20.04 LTS Focal Fossa Development Dependencies](./prerequisites_development_ubuntu.md)
- [Debian 10 Buster Development Dependencies](./prerequisites_development_debian.md)
- [MacOS 10.15 Catalina Development Dependencies](./prerequisites_development_macos.md)

## Installation

Instead of getting the tar.gz archive with the last version, as described in the main README, clone the whole repository with git version control system.

```bash
git clone https://github.com/LiskHQ/lisk-service.git # clone Lisk Service repository
cd lisk-service
```

Install all npm dependencies

```bash
make build-local
```

## Configuration

The `ecosystem.config.js` contains a sample configuration. Make sure it does reflect your local environment. All configuration parameters are described in the document [Configuration Options](./config_options.md).

## Managing Lisk Service

### Start Lisk Service

```bash
pm2 start ecosystem.config.js

# or

npm start
```

To check the service status, navigate to the URL <http://localhost:9901/api/status>. If it is running on a remote system, change the host name from `localhost` to the external IP Address of your machine.

### Lisk Service Status

After the process is started its runtime status and log location can be found by issuing this statement:
```bash
pm2 list
```

### Stop Lisk Service

```bash
pm2 stop ecosystem.config.js
```

### Restart Lisk Service

Restart all components of Lisk Service simultaneously.

```bash
pm2 restart ecosystem.config.js
```

### Remove all processes from PM2 list

```bash
pm2 delete ecosystem.config.js

# or

npm stop
```

### Clean all run-time files with dependencies

```bash
make clean
```