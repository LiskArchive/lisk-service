-- Create database(s).
CREATE DATABASE IF NOT EXISTS `lisk`;

-- Grant rights to `lisk` user.
GRANT ALL PRIVILEGES ON *.* TO 'lisk'@'%';

-- Create user for replica and grant replication privilege.
CREATE USER 'replica'@'%' IDENTIFIED WITH caching_sha2_password BY 'password';
GRANT REPLICATION SLAVE ON *.* TO 'replica'@'%';
FLUSH PRIVILEGES;
