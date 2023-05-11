-- Create database(s).
CREATE DATABASE IF NOT EXISTS `lisk`;

-- Grant rights to `lisk` user.
GRANT ALL PRIVILEGES ON *.* TO 'lisk'@'%';

-- Create user for replica and grant replication privilage.
CREATE USER 'replica'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT REPLICATION SLAVE ON *.* TO 'replica'@'%';
FLUSH PRIVILEGES;
