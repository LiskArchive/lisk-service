# Create databases.
CREATE DATABASE IF NOT EXISTS `lisk`;

# Create lisk user and grant rights.
GRANT ALL PRIVILEGES ON *.* TO 'lisk'@'%';

-- Create user for read replica and grant replication privilage
CREATE USER 'read_replica'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT REPLICATION SLAVE ON *.* TO 'read_replica'@'%';
FLUSH PRIVILEGES;
