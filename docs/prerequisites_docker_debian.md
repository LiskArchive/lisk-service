# Lisk Service prerequisites for Debian

Those requirements are needed to perform the recommended way of running Lisk Service on the server.

## Prerequisites

These programs and resources are required to install and run Lisk Service.

### APT 

In Ubuntu and its derivatives APT is the base package management application. Make sure your local APT registry is up-to-date.

```bash
apt update
```

### Linux development dependencies

Install `build-essential` package alongside with several development tools.

```bash
apt install build-essential git-core
```

### Docker

[Docker](https://www.docker.com/) is used as a run-time environment for Lisk Service. It takes care of most dependencies and simplifies the required configuration.

Follow the official documentation to install the most recent version of [Docker](https://docs.docker.com/engine/install/ubuntu/) on Ubuntu.

### Docker-compose

Follow the official [documentation](https://docs.docker.com/compose/install/) to install docker-compose.

## Next steps

If you have all dependencies installed properly, it is possible to run pre-build Docker images with Lisk Service. It is also possible to build those images locally by using the `make build-images` command.

Refer to the main [README](../README.md) file regarding the next steps.
