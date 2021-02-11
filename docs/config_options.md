# Lisk Service Configuration Reference

## Common settings

These options are available for all micro-services provided by Lisk Service.

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
ENABLE_HTTP_API=http-version1,http-version1-compat,http-status,http-version2
ENABLE_WS_API=rpc,rpc-v1,blockchain,rpc-v2
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
LISK_CORE_HTTP=https://mainnet.lisk.io # Lisk Core HTTP URL
LISK_CORE_WS=wss://mainnet.lisk.io     # Lisk Core WebSocket URL
LISK_CORE_CLIENT_TIMEOUT=30            # Lisk Core client timeout (in seconds)
```

### Internal cache & persistence

```bash
## Lisk Service Core

# Local Redis cache for Lisk microservice
# Note it is a different DB that SERVICE_BROKER uses
SERVICE_CORE_REDIS=redis://localhost:6379/1
```

### External services

```bash
# Lisk static assets, ie. known account lists
LISK_STATIC=https://static-data.lisk.io

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
