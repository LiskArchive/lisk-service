# Lisk Service Configuration Reference

## Common settings

These options are applicable to all the Lisk Service microservices.
When using the Docker setup, the default values specified in the [`docker/example.env`](../docker/example.env) file should suffice. To properly set the Docker environment variables, copy the [`docker/example.env`](../docker/example.env) file as `.env` and place it next to the [`docker-compose.yml`](../docker-compose.yml) file in the project's root directory. Please adjust the values for the environment variables, if necessary.

> **Note:**  If the Docker environment is being used, the minimum necessary environment variable that needs to be set is `LISK_APP_WS`.

### Service broker

```bash
# Must be identical for all microservices
# Make sure that all microservices are able to connect with the common Redis
SERVICE_BROKER=redis://lisk:password@127.0.0.1:6379/0

# Number of seconds to wait before returning a RequestTimeout error when it takes too long to return a value. To disable use 0.
SERVICE_BROKER_TIMEOUT=10
```
### Log configuration

```bash
SERVICE_LOG_STDOUT=true   # Asynchronous console output (non-blocking, preferred)
SERVICE_LOG_CONSOLE=false # console.log() output, only for debug
SERVICE_LOG_FILE=false    # file path ex. ./logs/service.log
SERVICE_LOG_GELF=false    # GELF output for remote logging ex. Graylog 127.0.0.1:12201/udp
SERVICE_LOG_LEVEL=info    # Default log level
DOCKER_HOST=local         # Custom field for logger. This will result in all log messages having the custom field _docker_host set to 'local'.
```

## Microservice-specific settings

Every Lisk Service microservice accepts various environment variables, that can be set to modify the application's behavior.\
For an exhaustive list of the supported environment variables, please check the `Configuration` section in the microservice specific README files.

The following lists all the available microservices and links to their documentation. Please follow the links to learn more about the available configurable environment variables.

1. [Gateway](../services/gateway/README.md#configuration)
2. [Connector](../services/blockchain-connector/README.md#configuration)
3. [Coordinator](../services/blockchain-coordinator/README.md#configuration)
4. [Indexer](../services/blockchain-indexer/README.md#configuration)
5. [App Registry](../services/blockchain-app-registry/README.md#configuration)
6. [Fee Estimator](../services/fee-estimator/README.md#configuration)
7. [Transaction Statistics](../services/transaction-statistics/README.md#configuration)
8. [Market](../services/market/README.md#configuration)
9. [Export](../services/export/README.md#configuration)
