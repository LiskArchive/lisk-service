-- Create `reader` user for read queries and grant read privilages.
CREATE USER 'reader'@'%' IDENTIFIED WITH caching_sha2_password BY 'password';
GRANT SELECT ON *.* TO 'reader'@'%';
FLUSH PRIVILEGES;

CHANGE REPLICATION SOURCE TO
    SOURCE_HOST = 'mysql-primary',
    SOURCE_PORT = 3306,
    SOURCE_USER = 'replica',
    SOURCE_PASSWORD = 'password',
    SOURCE_AUTO_POSITION = 1,
    GET_SOURCE_PUBLIC_KEY = 1;
