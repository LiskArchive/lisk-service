# Redis Authentication

To prevent unauthorized access to the Redis database and mitigate unintended behavior associated with the use of Redis' passwordless `default` user.

With Lisk Service [v0.7.2](https://github.com/LiskHQ/lisk-service/tree/v0.7.2), similar to our MySQL setup, we now enforce our custom authentication on Redis, by default, with the following credentials:

> **Username**: `lisk` <br>
> **Password**: `password`

To programmatically connect to Redis, please specify the authentication details in the connection string in the following format:

```
redis://<username>:<password>@<redis_server_ip>/<database_number>
```
> **Example**: redis://lisk:password@127.0.0.1/0

## Setting up new authenticated Redis instances

- Starting a dockerized Lisk Service instance from scratch should automatically take care of setting up proper authentication on Redis.

- When self-hosting Redis instances (PM2 users) please look into our following Redis config files:
  - [redis.persistent.conf](../docker/redis.persistent.conf)
  - [redis.volatile.conf](../docker/redis.volatile.conf)

When using a custom Redis config, please consider adding the following ACL configurations:

```
# ACL rule for a lisk user

requirepass password
user lisk on allkeys allchannels allcommands >password
user default off
```

## Setting up auth on existing passwordless Redis instances

To set up authentication on your current running Redis instance, execute the following commands after you log in to the Redis CLI:

```
CONFIG SET requirepass password
ACL SETUSER lisk on allkeys allchannels allcommands >password
ACL SETUSER default off
```

Verify that the changes are applied successfully with the following commands:

**Executing a command without authentication**:
```
/data # redis-cli info cpu
NOAUTH Authentication required.
```

**Executing a command with the authentication details**:
```
/data # redis-cli --user lisk --pass password info cpu
Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
# CPU
used_cpu_sys:1.359498
used_cpu_user:1.334618
used_cpu_sys_children:0.001210
used_cpu_user_children:0.000709
used_cpu_sys_main_thread:1.358968
used_cpu_user_main_thread:1.334302
```

> **NOTE**: To ensure smooth operation of Lisk Service post the current change, kindly restart the Redis server after authentication is set up.

## Using Redis auth-free

In case, you have an existing passwordless running instance of Redis and want to continue using it, please override all the Redis connection strings via the necessary environment variables either in the `.env` (Docker setup) or the `ecosystem.config.json` (PM2 setup) config files.

To easily find the necessary environment variables, open the relevant config file, and replace all the instances of `redis://lisk:password@` with `redis://`. Please ensure that the updated environment variables are enabled.

> **NOTE**: We _**highly recommend**_ using authentication on Redis.
