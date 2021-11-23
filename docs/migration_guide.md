# Lisk Service Migration Guide

## `0.5.0` -> `0.6.0`

### CSV transaction export

Lisk Service 0.6.0 allows to export transactions in CSV format.

To enable this feature make sure your PM2 config has the lisk-service-export microservice started. Docker script enables it automatically, however the gateway needs a param to enable it to the public.

Consider adding the `http-exports` string to `ENABLE_HTTP_API` in order to make this feature usable by the clients.

`ENABLE_HTTP_API=http-status,http-version2,http-exports`
