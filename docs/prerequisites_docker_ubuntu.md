# Lisk Service prerequisites for Ubuntu

The following requirements are needed to perform the recommended method of running Lisk Service on the server.

## Prerequisites

These programs and resources are required to install and run Lisk Service.

### APT 

In Ubuntu and its derivatives, APT is the base package management application. Please ensure your local APT registry is up-to-date.

```bash
sudo apt update
```

### Linux development dependencies

Please install the `build-essential` package together with the other necessary development tools.

```bash
sudo apt install -y build-essential git make
```

### Docker

[Docker](https://www.docker.com/) is used as a run-time environment for Lisk Service. It takes care of most dependencies and simplifies the required configuration.

Please follow the official documentation to install the most recent version of [Docker](https://docs.docker.com/engine/install/ubuntu/) on Ubuntu. Please continue with the post-installation steps to [Manage Docker as a non-root user](https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user).

### Docker-compose

Please follow the official [documentation](https://docs.docker.com/compose/install/) to install docker-compose.

## Next steps

When all of the dependencies are correctly installed, it will then be possible to run pre-build Docker images with Lisk Service. It is also possible to build those images locally by executing the `make build-images` command from within the `lisk-service` directory.

Refer to the main [README](../README.md) file regarding the next steps.
