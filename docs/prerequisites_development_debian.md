# Lisk Service Development Dependencies for Debian

Note that those requirements are needed only if you want to build the project from sources, without support for Docker. This is useful if you are going to develop the project for your own blockchain or you cannot run Docker on your target machine. In other scenarios such as running a stable version of Lisk Service against the mainnet network, it is highly recommended to follow [the Docker-based instruction](./prerequisites_docker_macos.md).

## Prerequisites

These programs and resources are required to install and run Lisk Service.

### APT 

In Ubuntu and its derivatives APT is the base package management application. Ensure your local APT registry is up-to-date.

```bash
apt update
```

### Linux development dependencies

Install `build-essential` package alongside with several development tools.

> - GNU Tar is already installed with the standard distribution.
> - GNU Make and Git have to be installed explicitly.

```bash
sudo apt install build-essential git-core make
```

### Redis

4. [Redis](http://redis.io) is used for caching temporary data.

```bash
sudo apt install redis-server
```

> Note: During this step it is possible to change your port if you wish to have more Redis instances in the future. Remember to adjust the environment variables `SERVICE_BROKER` and `SERVICE_CORE_REDIS` accordingly.

### PostgreSQL

[Postgres 10](https://www.postgresql.org/) is used for storing persistent data.

```bash
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -sc)-pgdg main" > /etc/apt/sources.list.d/PostgreSQL.list'

sudo apt update
sudo apt install postgres-10
```

> Note: During this step it is possible to change your port if you wish to have more Postgres instances in the future. Remember to adjust the environment variable `SERVICE_CORE_POSTGRES` accordingly.


### Node.js

3. [Node.js 12.x](<https://nodejs.org/>) serves as the underlying engine for code execution.

```bash
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -

sudo apt update
sudo apt install -y nodejs
```

> Having Node.js installed makes it possible to install [npm](https://www.npmjs.com/) packages.

### PM2

[PM2](https://github.com/Unitech/pm2) manages the node process for Lisk Service and handles log rotation.

```bash
npm install -g pm2
```

## Alternative: quick one-step install

Copy and paste the following snippet to complete the installation in one step.

```bash
# Add external repositories
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -sc)-pgdg main" > /etc/apt/sources.list.d/PostgreSQL.list'

# APT-based dependencies
sudo apt update
sudo apt install build-essential git-core make redis-server postgres nodejs

# NPM-based dependencies
npm install -g pm2
```

## Next steps

If you have all dependencies installed properly, you can start the build process.
