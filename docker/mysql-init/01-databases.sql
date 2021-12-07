# create databases
CREATE DATABASE IF NOT EXISTS `lisk`;
CREATE DATABASE IF NOT EXISTS `newsfeed`;

# create lisk user and grant rights
GRANT ALL PRIVILEGES ON *.* TO 'lisk'@'%';
