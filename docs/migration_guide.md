# Lisk Service Migration Guide

## `0.5.0` -> `0.6.0`

### CSV transaction export

Lisk Service 0.6.0 allows to export transactions in CSV format.

To enable this feature make sure your PM2 config has the lisk-service-export microservice started. Docker script enables it automatically, however the gateway needs a param to enable it to the public.

Consider adding the `http-exports` string to `ENABLE_HTTP_API` in order to make this feature available for users.

`ENABLE_HTTP_API=http-status,http-version2,http-exports`

### Blockchain index

Starting from `0.6.0` you do not need to rebuild the index every release. This will save much time during migrations and allow minimal interruptions of the Lisk Service availabilty.

To make a snapshot on the `0.5.0` instance the following steps are needed.

```bash
docker-compose stop core
docker-compose exec -T mysql_core mysqldump --no-create-db lisk -u root -ppassword > mysql_core_index.sql
```

Then you can stop Lisk Service and destroy old containers.

```bash
make down
```

Alternatively, you can download the snapshot online.

```bash
wget http://path.to.url/mysql_core_index_mainnet.sql.gz -o mysql_core_index.sql.gz
gzip mysql_core_index.sql.gz
```

Now switch to the `0.6.0` tag.

```bash
git checkout 0.6.0
make build
```

Ensure the file `mysql_core_index.sql` is placed in your root directory.
Then restore the backup in the `0.6.0` instance.

```bash
make up            # Start the new Lisk Service
make stop-core     # Stop the core microservice
make flush-index   # Drops the new empty index
make restore       # Restore the index from the snapshot
make start-core    # Start the core microservice
```

Now the index will catch up with the recently produced blocks.

It will also cause account re-indexing, this operation takes around 10 minutes. In the meantime the blockchain index will reach 100% and you can consider Lisk Service as fully operational. Once the 100% is reach CSV exports are possible.

We are working on making this procedure integrated with a standard Lisk Service procedure, stay tuned for updates.
