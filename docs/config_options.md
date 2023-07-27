# Lisk Service Configuration Reference

## Common settings

These options are available for all microservices provided by Lisk Service.
Most of them are set correctly in the Docker environment. To do so copy `docker/example.env` file as `.env` and place it next to `docker-compose.yml` and update the necessary environment variables.

> **Note:**  If the Docker environment is being used, the minimum necessary environment variable that needs to be set is `LISK_CORE_WS`.

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

Discover all the gateway specific configurations in this comprehensive listing [here](../services/gateway/README.md#configuration).


## App Registry

Discover all the app registry microservice specific configurations in this comprehensive listing [here](../services/blockchain-app-registry/README.md#configuration).

## Blockchain connector

Discover all the connector microservice specific configurations in this comprehensive listing [here](../services/blockchain-connector/README.md#configuration).

## Blockchain indexer

Discover all the indexer microservice specific configurations in this comprehensive listing [here](../services/blockchain-indexer/README.md#configuration).

## Blockchain coordinator

Discover all the coordinator microservice specific configurations in this comprehensive listing [here](../services/blockchain-coordinator/README.md#configuration).

## Transaction statistics

Discover all the transaction statistics microservice specific configurations in this comprehensive listing [here](../services/transaction-statistics/README.md#configuration).

## Fee estimator

Discover all the fee estimator microservice specific configurations in this comprehensive listing [here](../services/fee-estimator/README.md#configuration).

## Market

Discover all the market microservice specific configurations in this comprehensive listing [here](../services/market/README.md#configuration).

## Export

Discover all the export microservice specific configurations in this comprehensive listing [here](../services/export/README.md#configuration).