# create databases
CREATE DATABASE IF NOT EXISTS `lisk`;

# create lisk user and grant rights
GRANT ALL PRIVILEGES ON *.* TO 'lisk'@'%';
