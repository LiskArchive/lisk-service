# Lisk Service Development Dependencies for Ubuntu

Note that those requirements are needed only if you want to build the project from sources, without support for Docker. This is useful if you are going to develop the project for your own blockchain or you cannot run Docker on your target machine. In other scenarios such as running a stable version of Lisk Service against the mainnet network, it is highly recommended to follow [the Docker-based instruction](./prerequisites_docker_macos.md).

## Prerequisites

These programs and resources are required to install and run Lisk Service.

### APT

In Ubuntu and its derivatives APT is the base package management application. Please ensure your local APT registry is up-to-date.

```bash
sudo apt update
```

### Linux development dependencies

Please install the `build-essential` package together with the other necessary development tools.

> - GNU Tar is already installed with the standard distribution.
> - GNU Make and Git have to be installed explicitly.

```bash
sudo apt install -y build-essential git make
```

### Redis

[Redis](http://redis.io) is used for caching temporary data.

```bash
sudo apt install -y redis-server
```

> Note: During this step it is possible to change your port if you wish to have more Redis instances in the future. Remember to adjust the environment variables `SERVICE_BROKER` and `SERVICE_CORE_REDIS` accordingly.

### MySQL

[MySQL 8](https://dev.mysql.com/downloads/mysql/) is used for storing persistent data.

```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### Node.js

[Node.js 18](https://nodejs.org/) serves as the underlying engine for code execution. We recommend using [NVM](https://github.com/nvm-sh/nvm) to easily manage various Node.js versions locally.

Follow the official documentation to install the most recent version of [NVM](https://github.com/nvm-sh/nvm) on Ubuntu.
After installing nvm, navigate to the lisk-service repository and use the following commands to install the necessary Node.js version and set it as default:

```
nvm install
nvm alias default 18
npm i -g yarn
```

> Having Node.js installed makes it possible to install [npm](https://www.npmjs.com/) packages.

### PM2

[PM2](https://github.com/Unitech/pm2) manages the node process for Lisk Service and handles log rotation.

```bash
npm install -g pm2
```

> In case of an `EACCES` error, it is recommended to check the following: [Resolving EACCES permissions errors when installing packages globally](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally).

## Alternative: quick one-step install

Copy and paste the following snippet to complete the installation in one step:

```bash
# Add external repositories
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -sc)-pgdg main" > /etc/apt/sources.list.d/PostgreSQL.list'

# APT-based dependencies
sudo apt update
sudo apt install -y build-essential git make redis-server nodejs mysql-server
sudo mysql_secure_installation

# NPM-based dependencies
npm install -g pm2
```

## Next steps

If you have all dependencies installed properly, you can start the build process.
