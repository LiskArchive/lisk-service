# Lisk Service installation for Linux

## Prerequisites

These programs and resources are required to install and run Lisk Service.

- Node.js 10.19.0 or higher (<https://nodejs.org/>) -- Node.js serves as the underlying engine for code execution.

	```bash
	  curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
	  sudo apt-get install -y nodejs
	```
- Update `npm` to the version 6.x

	```bash
	  npm install -g npm@6
	```

- Redis (<http://redis.io>) -- Redis is used for caching parsed exchange data.

	```bash
	  sudo apt-get install -y redis-server
	```

> Note: During this step it is possible to change your port if you wish to have more Redis instances in the future. Remember to adjust the environment variables `SERVICE_BROKER` and `SERVICE_CORE_REDIS` accordingly.

- Freegeoip (<https://github.com/fiorix/freegeoip>) -- Freegeoip is used by the Network Monitor for IP address geo-location.

	```bash
	  wget https://github.com/fiorix/freegeoip/releases/download/v3.4.1/freegeoip-3.4.1-linux-amd64.tar.gz
	  tar -zxf freegeoip-3.4.1-linux-amd64.tar.gz
	  ln -s freegeoip-3.4.1-linux-amd64 freegeoip
	  nohup ./freegeoip/freegeoip > ./freegeoip/freegeoip.log 2>&1 &
	```

- PM2 (https://github.com/Unitech/pm2) -- PM2 manages the node process for Lisk Service and handles log rotation (Highly Recommended)

  ```bash
  sudo npm install -g pm2
  ```

- Git (<https://github.com/git/git>) -- Used for cloning and updating Lisk Service

  ```bash
  sudo apt-get install -y git
  ```

- Tool chain components -- Used for compiling dependencies

  ```bash
  sudo apt-get install -y python build-essential automake autoconf libtool
  ```
