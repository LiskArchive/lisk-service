# Lisk Service Configuration Reference

## Common settings

These options are available for all microservices provided by Lisk Service.

### Service broker

```bash
# Must be identical for all microservices
# Make sure that all microservices are able to connect with the common Redis
SERVICE_BROKER=redis://localhost:6379/0

# Number of seconds to wait before returning a RequestTimeout error when it takes too long to return a value. To disable use 0.
SERVICE_BROKER_TIMEOUT=10
```
### Log configuration

```bash
SERVICE_LOG_STDOUT=true   # Asynchronous console output (non-blocking, preferred)
SERVICE_LOG_CONSOLE=false # console.log() output, only for debug
SERVICE_LOG_FILE=false    # file path ex. ./logs/service.log
SERVICE_LOG_GELF=false    # GELF output for remote logging ex. Graylog localhost:12201/udp
SERVICE_LOG_LEVEL=info    # Default log level
DOCKER_HOST=local         # Custom field for logger. This will result in all log messages having the custom field _docker_host set to 'local'.
```


## Gateway settings

### Server settings

```bash
# Host and Port that provides the possibility to connect with Lisk Service.
# For HTTP and WebSocket
PORT=9901
HOST=0.0.0.0   # or 127.0.0.1 for localhost

# Allow request from the comma separated string of origins.
# By default, it is set to * which allows request from all origins.
CORS_ALLOWED_ORIGIN=*
```

### API settings

```bash
# Enable certain APIs (HTTP & WebSocket)
# Use comma separated list
ENABLE_HTTP_API=http-status,http-version3,http-exports
ENABLE_WS_API=blockchain,rpc-v3
```

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

### Websocket rate limit settings

```bash
# To enable websocket rate limit, the `WS_RATE_LIMIT_ENABLE` environment variable is required to be true.
# Number of connections per second can be set using 
# `WS_RATE_LIMIT_CONNECTIONS` and `WS_RATE_LIMIT_DURATION` environment 
# variable. currently defaults to `5 connections per second`
WS_RATE_LIMIT_ENABLE=true
WS_RATE_LIMIT_CONNECTIONS=5
WS_RATE_LIMIT_DURATION=1
```

### HTTP Requests rate limit settings

```bash
# To enable `HTTP Rate limit`, the `HTTP_RATE_LIMIT_ENABLE` environment variable is required to be true.
# The `HTTP Rate limit` directives can be set using `HTTP_RATE_LIMIT_WINDOW` and `HTTP_RATE_LIMIT_CONNECTIONS` environment 
# variable.
HTTP_RATE_LIMIT_ENABLE=true
HTTP_RATE_LIMIT_WINDOW=10 # To keep record of requests in memory (in seconds). Defaults to 10 seconds
HTTP_RATE_LIMIT_CONNECTIONS=200 # Max number of requests during window. Defaults to 200 requests
HTTP_RATE_LIMIT_ENABLE_X_FORWARDED_FOR=false # When set to true, the rate limiting algorithm considers the X-Forwarded-For header value to determine the client's IP address for rate limiting purposes. By default, it is set to false.
HTTP_RATE_LIMIT_NUM_KNOWN_PROXIES=0 # Defines the number of proxies that exist between the gateway and the external client application, enabling accurate identification of the client's IP address for rate limiting. Requires HTTP_RATE_LIMIT_ENABLE_X_FORWARDED_FOR to be enabled. By default, it is set to 0.
```

### Compatibility settings

```bash
# Enabled requires clients to pass the full JSON-RPC envelope.
# Disabled allows clients to pass only `method` in the request
# and does not check the envelope whether it has `jsonrpc: "2.0"` or not.
JSON_RPC_STRICT_MODE=false
```

### External dependancies

```bash
# URL of the volatile cache storage (Redis)
SERVICE_GATEWAY_REDIS_VOLATILE='redis://localhost:6379/5'
```

### Operational settings

```bash

# Services on which the gateway is dependent
# Can be expressed as a CSV
GATEWAY_DEPENDENCIES='indexer,connector'

# Job run interval/schedule to update the readiness status.
# By default, interval is set to 0 (disabled) and schedule is set to run every minute (* * * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_UPDATE_READINESS_STATUS=0
JOB_SCHEDULE_UPDATE_READINESS_STATUS='* * * * *'
```


## App Registry

### External dependancies
```bash
# Mysql settings
SERVICE_APP_REGISTRY_MYSQL=mysql://lisk:password@mysql-primary:3306/lisk

# Truncate the table and rebuild at application init. Defaults to false.
ENABLE_REBUILD_INDEX_AT_INIT=false
```

### GitHub app registry settings
```bash
# GitHub respository and branch
# GitHub token with read access is required incase the repo is private
GITHUB_ACCESS_TOKEN=''
GITHUB_APP_REGISTRY_REPO=''https://github.com/LiskHQ/app-registry
GITHUB_APP_REGISTRY_REPO_BRANCH='main'
```

### Operational settings
```bash
# Default blockchain applications. By default it is set to lisk_mainchain.
# Can be expressed as csv.
DEFAULT_APPS=lisk_mainchain

# Job interval/schedule to delete non-metadata files.
# By default, interval is set to 0 (disabled) and schedule is set to run every midnight (0 0 * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_DELETE_NON_METADATA_FILES=0
JOB_SCHEDULE_DELETE_NON_METADATA_FILES='0 0 * * *'

# Job interval/schedule to update off-chain metadata.
# By default, interval is set to 0 (disabled) and schedule is set to run every 10 minutes (*/10 * * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_UPDATE_METADATA=${JOB_INTERVAL_UPDATE_METADATA}
JOB_SCHEDULE_UPDATE_METADATA=${JOB_SCHEDULE_UPDATE_METADATA}
```


## Blockchain connector

### Lisk client
```bash
# URL to connect with the Lisk SDK-based application node over WebSocket.
LISK_APP_WS='ws://127.0.0.1:7887'

# IPC connection Lisk SDK based application node.
USE_LISK_IPC_CLIENT=false # Boolean flag to enable IPC connection.
LISK_APP_DATA_PATH='~/.lisk/lisk-core' # Data path to connect over IPC.

# URL of the Lisk SDK-based application' genesis block.
# Only to be used when the genesis block is large enough to be transmitted over API calls within the timeout.
GENESIS_BLOCK_URL=''
```

### Cashing
```bash
# To enable block caching, the ENABLE_BLOCK_CACHING environment variable is required to be true. By default it is set to false.
# To set expiry time (in hours) for block cache use EXPIRY_IN_HOURS environment variable. By default it is set to 12.
ENABLE_BLOCK_CACHING=false
EXPIRY_IN_HOURS=12
```

### External dependancies
```bash
# URL of GeoIP server
GEOIP_JSON: URL of GeoIP server
```

### Operational settings
```bash
# Add testing methods. By default set to false.
ENABLE_TESTING_MODE=false

# Job interval/schedule to cleanup block cache.
# By default, interval is set to 0 (disabled) and schedule is set to run every 12 hours (0 */12 * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_CACHE_CLEANUP=0
JOB_SCHEDULE_CACHE_CLEANUP='0 */12 * * *'

# Job interval/schedule to update off-chain metadata.
# By default, interval is set to 60 (60 seconds) and schedule is not set.
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_REFRESH_PEERS=50
JOB_SCHEDULE_REFRESH_PEERS=''
```

## Indexer

### External dependancies
```bash
# Redis settings.
# URL of the cache storage (Redis).
SERVICE_INDEXER_CACHE_REDIS=redis://redis_persistent:6379/0
# URL of the volatile cache storage (Redis).
SERVICE_INDEXER_REDIS_VOLATILE=redis://redis_volatile:6379/0
# URL of the job queue to process the scheduled indexing jobs by the Blockchain Coordinator (Redis).
SERVICE_MESSAGE_QUEUE_REDIS=redis://redis_persistent:6379/8

# Mysql settings
# Connection string of the (read/write) primary MySQL instance
SERVICE_INDEXER_MYSQL=mysql://lisk:password@mysql-primary:3306/lisk 
# Connection string of the (read only) replicated MySQL proxy instance.
SERVICE_INDEXER_MYSQL_READ_REPLICA=mysql://reader:password@mysql-read-replica-haproxy:3307/lisk

# Lisk static assets, ie. known account lists
LISK_STATIC=https://static-data.lisk.com
```

### Indexing settings
```bash

# Enable Indexing and data retrival modes
# Both are enabled by default.
ENABLE_DATA_RETRIEVAL_MODE=true
ENABLE_INDEXING_MODE=true

# Permanently maintain the events in the MySQL database. Disabled by default.
ENABLE_PERSIST_EVENTS=false

# Devnet and mainchain URLs for custom deployments.
MAINCHAIN_SERVICE_URL=''
DEVNET_MAINCHAIN_URL='http://devnet-service.liskdev.net:9901'

# Transaction buffer bytes to consider when estimating the transaction fees. By default, it is set to 6.
ESTIMATES_BUFFER_BYTES_LENGTH=6
```

### Operational settings
```bash
# Job interval/schedule to delete serialized events.
# By default, interval is set to 0 (disabled) and schedule is set to run every 5 minutes (*/5 * * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_DELETE_SERIALIZED_EVENTS=0
JOB_SCHEDULE_DELETE_SERIALIZED_EVENTS='*/5 * * * *'

# Job interval/schedule to refresh validators cache.
# By default, interval is set to 0 (disabled) and schedule is set to run every 5 minutes (*/5 * * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_REFRESH_VALIDATORS=0
JOB_SCHEDULE_REFRESH_VALIDATORS='*/5 * * * *'

# Job interval/schedule to validate the rank for all the validators.
# By default, interval is set to 0 (disabled) and schedule is set to run every 15 minutes, and starts at 4 minutes past the hour (4-59/15 * * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_VALIDATE_VALIDATORS_RANK=0
JOB_SCHEDULE_VALIDATE_VALIDATORS_RANK='4-59/15 * * * *'

# Job interval/schedule to refresh indexing status.
# By default, interval is set to 10 (10 seconds) and schedule is not set.
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_REFRESH_INDEX_STATUS=10
JOB_SCHEDULE_REFRESH_INDEX_STATUS=''

# Job interval/schedule to refresh blockchain application statistics.
# By default, interval is set to 0 (disabled) and schedule is set to run every 15 minutes (*/15 * * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_REFRESH_BLOCKCHAIN_APPS_STATS=0
JOB_SCHEDULE_REFRESH_BLOCKCHAIN_APPS_STATS='*/15 * * * *'

# Job interval/schedule to refresh account knowledge.
# By default, interval is set to 0 (disabled) and schedule is set to run every 15 minutes (*/15 * * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_REFRESH_ACCOUNT_KNOWLEDGE=0
JOB_SCHEDULE_REFRESH_ACCOUNT_KNOWLEDGE='*/15 * * * *'

# Job interval/schedule to delete finalized CCU metadata.
# By default, interval is set to 0 (disabled) and schedule is set to run once a day at 02:00 am (0 2 * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_DELETE_FINALIZED_CCU_METADATA=0
JOB_SCHEDULE_DELETE_FINALIZED_CCU_METADATA='0 2 * * *'

# Job interval/schedule to trigger account updates.
# By default, interval is set to 0 (disabled) and schedule is set to run every 15 minutes (*/15 * * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_TRIGGER_ACCOUNT_UPDATES=0
JOB_SCHEDULE_TRIGGER_ACCOUNT_UPDATES='*/15 * * * *'  
```

### Mysql Snapshot settings

```bash
# Enable or disable apply snapshot feature
ENABLE_APPLY_SNAPSHOT=true

# Custom snapshot url (Expected to end with sql.gz)
INDEX_SNAPSHOT_URL='https://snapshots.lisk.io/mainnet/service.sql.gz'

# Enable or disable downloading snaphot from a HTTP URL.
ENABLE_SNAPSHOT_ALLOW_INSECURE_HTTP=false
```


## Blockchain coordinator

### External dependancies
```bash
# Redis settings
# URL of the job queue to schedule the indexing jobs (Redis).
SERVICE_MESSAGE_QUEUE_REDIS=redis://redis_persistent:6379/8
```

### Operational settings
```bash
# Job interval/schedule to index missing blocks.
# By default, interval is set to 0 (disabled) and schedule is set to run every 15 minutes (*/15 * * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_INDEX_MISSING_BLOCKS=0
JOB_SCHEDULE_INDEX_MISSING_BLOCKS='*/15 * * * *'
```


## Transaction statistics

### External dependancies
```bash
# Redis settings.
# URL of the cache storage (Redis).
SERVICE_STATISTICS_REDIS=redis://redis_persistent:6379/0

# Mysql settings
# Connection string of the (read/write) primary MySQL instance
SERVICE_STATISTICS_MYSQL=mysql://lisk:password@mysql-primary:3306/lisk 
# Connection string of the (read only) replicated MySQL proxy instance.
SERVICE_STATISTICS_MYSQL_READ_REPLICA=mysql://reader:password@mysql-read-replica-haproxy:3307/lisk
```

### Operational settings
```bash
#The number of days for which the transaction statistics need to be built in retrospect to the application init.
TRANSACTION_STATS_HISTORY_LENGTH_DAYS=5

# Job interval/schedule to refresh transaction statistics.
# By default, interval is set to 0 (disabled) and schedule is set to run every 30 minutes (*/30 * * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_REFRESH_TRANSACTION_STATS=0
JOB_SCHEDULE_REFRESH_TRANSACTION_STATS='*/30 * * * *'

# Job interval/schedule to verify if the transaction statistics have been built correctly.
# By default, interval is set to 0 (disabled) and schedule is set to run every 3rd hour after the first 15 minutes (15 */3 * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_VERIFY_TRANSACTION_STATS=0
JOB_SCHEDULE_VERIFY_TRANSACTION_STATS='15 */3 * * *'
```


## Fee estimator

### External dependancies
```bash
# Redis settings
# URL of the cache storage (Redis).
SERVICE_FEE_ESTIMATOR_CACHE=redis://redis_persistent:6379/0
```

### Operational settings
```bash
# Enable quick algorithm
ENABLE_FEE_ESTIMATOR_QUICK=true

# Enable full algorithm
ENABLE_FEE_ESTIMATOR_FULL=false

# How many blocks are analyzed during cold start
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


## Market

### External dependancies
```bash
# Redis settings
SERVICE_MARKET_REDIS=redis://redis_persistent:6379/2
```

### Operational settings
```bash
# Access key to fetch data from the exchangeratesapi.io API.
EXCHANGERATESAPI_IO_API_KEY=''

# Supported fiat currencies.
SERVICE_MARKET_FIAT_CURRENCIES='EUR,USD,CHF,GBP,RUB,PLN,JPY,AUD,GBP,INR'

# Supported target pairs.
SERVICE_MARKET_TARGET_PAIRS='LSK_BTC,LSK_EUR,LSK_USD,LSK_CHF,LSK_PLN,LSK_JPY,LSK_AUD,LSK_GBP,LSK_INR,BTC_EUR,BTC_USD,BTC_CHF'

# Job interval/schedule to refresh prices from Binance.
# By default, interval is set to 0 (disabled) and schedule is set to run every minute (* * * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_REFRESH_PRICES_BINANCE=0
JOB_SCHEDULE_REFRESH_PRICES_BINANCE='* * * * *'

# Job interval/schedule to refresh prices from Bittrex.
# By default, interval is set to 0 (disabled) and schedule is set to run every minute (* * * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_REFRESH_PRICES_BITTREX=0
JOB_SCHEDULE_REFRESH_PRICES_BITTREX='* * * * *'

# Job interval/schedule to refresh prices from exchangeratesapi.
# By default, interval is set to 0 (disabled) and schedule is set to run every minute (* * * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_REFRESH_PRICES_EXCHANGERATESAPI=0
JOB_SCHEDULE_REFRESH_PRICES_EXCHANGERATESAPI='* * * * *'

# Job interval/schedule to refresh prices from Kraken.
# By default, interval is set to 0 (disabled) and schedule is set to run every minute (* * * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_REFRESH_PRICES_KRAKEN=0
JOB_SCHEDULE_REFRESH_PRICES_KRAKEN='* * * * *'

# Job interval/schedule to update market prices.
# By default, interval is set to 5 (5 seconds) and schedule is not set.
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_UPDATE_PRICES=5
JOB_SCHEDULE_UPDATE_PRICES=''
```

## Export

### External dependancies
```bash
# Redis channel
# URL of the cache storage (Redis).
SERVICE_EXPORT_REDIS=redis://localhost:6379/3
# URL of the volatile cache storage (Redis)
SERVICE_EXPORT_REDIS_VOLATILE=redis://localhost:6379/4
```

### Object storage settings
```bash

# Partial settings
EXPORT_S3_BUCKET_NAME_PARTIALS='partials'
SERVICE_EXPORT_PARTIALS='./data/partials'

# Export settings
SERVICE_EXPORT_STATIC='./data/static'
EXPORT_S3_BUCKET_NAME_EXPORTS='exports'
  
# S3 settings
EXPORT_S3_ENDPOINT=''
EXPORT_S3_ACCESS_KEY=''
EXPORT_S3_SECRET_KEY=''
EXPORT_S3_SESSION_TOKEN='' 
EXPORT_S3_REGION=''  # Optional
EXPORT_S3_BUCKET_NAME=''  # Optional
```

### Operational settings
```bash
# Job interval/schedule to cleanup cache.
# By default, interval is set to 0 (disabled) and schedule is set to run daily at 04:45 am (45 4 * * *).
# Interval takes priority if it is set to a number greater than 0.
JOB_INTERVAL_CACHE_PURGE=0
JOB_SCHEDULE_CACHE_PURGE='45 4 * * *'
```