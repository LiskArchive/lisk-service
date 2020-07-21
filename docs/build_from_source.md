# Build Lisk Service from Source

Building and running Lisk Service from source is an alternative way to run it on the server or development environment. This technique is useful on systems where there no possibility of using Docker and for development purposes.

## Prerequisites

In order to run a local version of Lisk Service, the following development dependencies have to be installed.

- [Ubuntu 18.04 LTS Bionic Beaver Development Dependencies](./prerequisites_development_ubuntu.md)
- [Ubuntu 20.04 LTS Focal Fossa Development Dependencies](./prerequisites_development_ubuntu.md)
- [Debian 10 Buster Development Dependencies](./prerequisites_development_debian.md)
- [MacOS 10.15 Catalina Development Dependencies](./prerequisites_development_macos.md)

## Get sources with version control

In the contrary to the production version, make sure that the whole Git repository is cloned on your machine.

Instead of getting the tar.gz archive with the last version, as described in the main README, clone the whole repository with git version control system.

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

Install all npm dependencies from root directory.

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

## Next steps

Now you can use you favorite editor to make changes in the source files. Take a look at the [template](../services/template) project to find some nice examples.

Once done you can also build Docker images with `make build` and run them using the method from the main [README](../README.md).
