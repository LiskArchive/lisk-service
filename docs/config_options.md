# Lisk Service Configuration Reference

## Common settings

These options are available for all micro-services provided by Lisk Service.

Note that most of them are set correctly in the Docker environment.

If the Docker environment is being used, only the required variable `LISK_CORE_WS` is needed.

### Service broker

```bash
# Must be identical for all micro-serivces
# Make sure that all micro-services are able to connect with the common Redis
SERVICE_BROKER=redis://localhost:6379/0
```
### Log configuration

```bash
SERVICE_LOG_STDOUT=true   # Asynchronous console output (non-blocking, preferred)
SERVICE_LOG_CONSOLE=false # console.log() output, only for debug
SERVICE_LOG_FILE=false    # file path ex. ./logs/service.log
SERVICE_LOG_GELF=false    # GELF output for remote logging ex. Graylog localhost:12201/udp
SERVICE_LOG_LEVEL=info    # Default log level
```

## Gateway settings

### Server settings

```bash
# Port that provides the possibility to connect with Lisk Service
# For HTTP and WebSocket
PORT=9901
HOST=0.0.0.0   # or 127.0.0.1 for localhost
```

### API settings

```bash
# Enable certain APIs (HTTP & WebSocket)
# Use comma separated list
ENABLE_HTTP_API=http-status,http-version2
ENABLE_WS_API=blockchain,rpc-v2
```

Note: Since the SDK version 5 the HTTP APIs `http-version1,http-version1-compat` and WebSocket APIs `rpc,rpc-v1` are considered deprecated. Please use only `version2` APIs when connecting to the SDKv5-based node.

### Caching

```bash
# To enable response caching, the ENABLE_HTTP_CACHE_CONTROL environment 
# variable is required to be true. This would include the Cache-Control
# header within the responses.
ENABLE_HTTP_CACHE_CONTROL=true

# The `Cache-Control` directives can be overridden with the `HTTP_CACHE_CONTROL_DIRECTIVES` 
# environment variable and currently defaults to `public, max-age=10`.
HTTP_CACHE_CONTROL_DIRECTIVES='public, max-age=10'

# To enable RPC response caching, the `ENABLE_REQUEST_CACHING` environment 
# variable is required to be true.
ENABLE_REQUEST_CACHING=true
```

### Websocket settings

```bash
# To enable websocket rate limit, the `RATE_LIMIT_ENABLE_WS` environment variable is required to be true.
# Number of connections per second can be set using 
# `RATE_LIMIT_CONNECTIONS_WS` and `RATE_LIMIT_DURATION_WS` environment 
# variable. currently defaults to `5 connections per second`
RATE_LIMIT_ENABLE_WS=true
RATE_LIMIT_CONNECTIONS_WS=5
RATE_LIMIT_DURATION_WS=1
```

### HTTP Requests rate limit settings

```bash
# To enable `HTTP Rate limit`, the `RATE_LIMIT_ENABLE_HTTP` environment variable is required to be true.
# The `HTTP Rate limit` directives can be set using `RATE_LIMIT_WINDOW_HTTP` and `RATE_LIMIT_CONNECTIONS_HTTP` environment 
# variable.
RATE_LIMIT_ENABLE_HTTP=true
RATE_LIMIT_WINDOW_HTTP=10 # To keep record of requests in memory (in seconds). Defaults to 10 seconds
RATE_LIMIT_CONNECTIONS_HTTP=200 # Max number of requests during window. Defaults to 200 requests
```

### Compatibility settings

```bash
# Enabled requires clients to pass the full JSON-RPC envelope.
# Disabled allows clients to pass only `method` in the request
# and does not check the envelope whether it has `jsonrpc: "2.0"` or not.
JSON_RPC_STRICT_MODE=false
```

## Lisk settings

### Node settings

```bash
LISK_CORE_WS=ws://localhost:8080       # Lisk Core WebSocket RPC API
LISK_CORE_CLIENT_TIMEOUT=30            # Lisk Core client timeout (in seconds)
```

Deprecated settings

```
# This setting is required only for SDK version 4 or lower.
LISK_CORE_HTTP=https://mainnet.lisk.com # Lisk Core HTTP URL
```

### Internal cache & persistence

```bash
## Lisk Service Core

# Local Redis cache with persistency for Core microservice
# Refer to the /docker/redis/redis.persistent.conf for more details
# Note: SERVICE_BROKER uses a different DB
SERVICE_CORE_REDIS=redis://localhost:6379/1

# Local Redis LRU cache for Core microservice
# This should be a separate instance in the production
# Refer to the /docker/redis/redis.volatile.conf for more details
SERVICE_CORE_REDIS_VOLATILE=redis://localhost:6379/2

# MySQL settings
SERVICE_CORE_MYSQL=mysql://lisk:password@localhost:3306/lisk_service_core

# MySQL install (for local Docker container)
MYSQL_ROOT_PASSWORD=password
MYSQL_DATABASE=lisk
MYSQL_USER=lisk
MYSQL_PASSWORD=password
```

### External services

```bash
# Lisk static assets, ie. known account lists
LISK_STATIC=https://static-data.lisk.com

# Lisk Service geolocation backend
GEOIP_JSON=https://geoip.lisk.io/json
```

### Indexing

```bash
# Important: The number of blocks makes the process responsible of creating
# and maintaining search index of the given number of blocks behind the current height.
#
# indexNumOfBlocks = 0 means that index will consist of all blocks.
#
# The block index may trigger indexing of other entities that are part of the block
# such as transactions, accounts, votes etc.
INDEX_N_BLOCKS=202
```

### Transaction statistics

```bash
# Enable or disable transaction statistics feature
ENABLE_TRANSACTION_STATS=true

# Set update interval to 1 hour
TRANSACTION_STATS_UPDATE_INTERVAL=3600 # seconds

# How many days would be analyzed
TRANSACTION_STATS_HISTORY_LENGTH_DAYS=5
```

### Fee estimator

```bash
# Enable quick algorithm
ENABLE_FEE_ESTIMATOR_QUICK=true

# Enable full algorithm
ENABLE_FEE_ESTIMATOR_FULL=false

# How many blocks are analyzed during coldstart
FEE_EST_COLD_START_BATCH_SIZE=1

# At what height does the blockchain start using dynamic fees
FEE_EST_DEFAULT_START_BLOCK_HEIGHT=1

# Estimated moving average algorithm configuration
# Extra settings for advanced users. They might be useful for getting
# more precise results under specific circumstances.
# The default settings are sufficient for most environments.
FEE_EST_EMA_BATCH_SIZE=20
FEE_EST_EMA_DECAY_RATE=0.5
FEE_EST_WAVG_DECAY_PERCENTAGE=10
```
