const http = require('http');
const mockserver = require('mockserver');
const log4js = require('log4js');

const logger = log4js.getLogger();
logger.level = 'info';

const apiName = 'Bitcoin';
const host = '127.0.0.1';
const port = 9007;

const server = http.createServer(mockserver('bitcoin_http_mocks'));

server.listen(port, [host], err => {
	if (err) logger.error(err);
	else logger.info(`Mockserver for ${apiName} is listening on ${host}:${port}`);
});
