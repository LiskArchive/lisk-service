# Lisk Service Configuration Reference

## Common settings

These options are available for all micro-services provided by Lisk Service.

```bash
## Service broker

# Must be identical for all micro-serivces
# Make sure that all micro-services are able to connect with ir
SERVICE_BROKER=redis://localhost:6379/0

## Lisk Service log config

SERVICE_LOG_STDOUT=true   # Asynchronous console output (non-blocking, preferred)
SERVICE_LOG_CONSOLE=false # console.log() output, only for debug
SERVICE_LOG_FILE=false    # file path ex. ./logs/service.log
SERVICE_LOG_GELF=false    # GELF output for remote logging ex. Graylog localhost:12201/udp
SERVICE_LOG_LEVEL=debug   # Default log level
```

## Gateway settings

```bash
# Port that provides the possibility to connect with Lisk Service
# For HTTP and WebSocket
PORT=9901
```

## Lisk settings

```bash
LISK_CORE_HTTP=https://mainnet.lisk.io # Lisk Core HTTP URL
LISK_CORE_WS=wss://mainnet.lisk.io     # Lisk Core WebSocket URL
LISK_CORE_CLIENT_TIMEOUT=30            # Lisk Core client timeout (in seconds)
```

```bash
## Lisk Service Core

# Local Redis cache for Lisk micro-service
# Note it is a different DB that SERVICE_BROKER uses
SERVICE_CORE_REDIS=redis://localhost:6379/1

# Lisk static assets, ie. known account lists
LISK_STATIC=https://static-data.lisk.io

# Lisk Service geolocation backend
GEOIP_JSON=https://geoip.lisk.io/json
```
