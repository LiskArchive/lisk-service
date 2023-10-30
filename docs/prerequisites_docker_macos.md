# Lisk Service prerequisites for MacOS

Those requirements are necessary in order to perform the recommended method of running Lisk Service on the server.

## Prerequisites

These programs and resources are required to install and run Lisk Service.

### Brew

Install [Brew](https://brew.sh/) by following [the most recent instruction](https://brew.sh/).

If you already have Brew installed, make sure it is working and up-to-date.

```bash
brew update
brew doctor
```

### Xcode

Install [Xcode](https://developer.apple.com/xcode/) essentials coming from Apple.

```bash
xcode-select --install
```

> Tip: You can skip this point if you have already installed the full version of [XCode](https://developer.apple.com/xcode/).

### Docker

[Docker](https://www.docker.com/) is used as a run-time environment for Lisk Service. It takes care of most dependencies and simplifies the required configuration.

Follow the official documentation to install [Docker Desktop](https://docs.docker.com/docker-for-mac/install/) on MacOS.

### Docker-compose

The most recent version of Docker Desktop already contains docker-compose tool. Visit [the official documentation page](https://docs.docker.com/compose/install/) for more information.

## Next steps

If you have all dependencies installed properly, it is possible to run pre-build Docker images with Lisk Service. It is also possible to build those images locally by using the `make build-images` command.

Refer to the main [README](../README.md) file regarding the next steps.
