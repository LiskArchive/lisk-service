# Lisk Service Development Dependencies for MacOS

Note that those requirements are needed only if you want to build the project from sources, without support for Docker. This is useful if you are going to develop the project for your own blockchain or you cannot run Docker on your target machine. In other scenarios such as running a stable version of Lisk Service against the mainnet network, it is highly recommended to follow [the Docker-based instruction](./prerequisites_docker_macos.md).

## Prerequisites

These programs and resources are required to install and run Lisk Service.

### Only on M1 Mac

### Brew

Install [Brew](https://brew.sh/) by following [the most recent instruction](https://brew.sh/).

If you already have Brew installed, make sure it is working and up-to-date.

```bash
brew update
brew doctor
```

### Xcode

Install [Xcode](https://developer.apple.com/xcode/) essentials coming from Apple.

This package provides the `make` command.

```bash
xcode-select --install
```

> Tip: You can skip this point if you have already installed the full version of [XCode](https://developer.apple.com/xcode/).

### Redis

4. [Redis](http://redis.io) is used for caching temporary data.

```bash
brew install redis
```

> Note: During this step it is possible to change your port if you wish to have more Redis instances in the future. Remember to adjust the environment variables `SERVICE_BROKER` and `SERVICE_CORE_REDIS` accordingly.


### MySQL

[MySQL 5.7](https://dev.mysql.com/downloads/mysql/5.7.html) is used for storing persistent data.

```bash
brew tap homebrew/services
brew install mysql@8
brew services start mysql@8
```

### Node.js

3. [Node.js 12.x](<https://nodejs.org/>) serves as the underlying engine for code execution.

```bash
brew install node@12
```

> Having Node.js installed makes it possible to install [npm](https://www.npmjs.com/) packages.

### PM2

[PM2](https://github.com/Unitech/pm2) manages the node process for Lisk Service and handles log rotation.

```bash
npm install -g pm2
```

## Next steps

If you have all dependencies installed properly, you can start the build process.
