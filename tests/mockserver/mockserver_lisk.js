const http = require('http');
const httpProxy = require('http-proxy');
const mockserver = require('mockserver');
const log4js = require('log4js');
const socketIo = require('socket.io');
const blocks = require('./lisk_ws_mocks/blocksChange.json');
const transactions = require('./lisk_ws_mocks/transactionsChange.json');
const rounds = require('./lisk_ws_mocks/roundsChange.json');

const logger = log4js.getLogger();
logger.level = 'info';

const proxy = httpProxy.createProxyServer({});
const mockserverName = 'Lisk Core Mock';
const liskCoreServerUrl = process.env.LISK_CORE_HTTP || 'http://127.0.0.1:4000';
const eventFreqMultiplier = 1000;
const port = process.env.PORT || 9007;

const server = http.createServer((req, res) => {
	if (req.url.includes('/api/peers')) {
		mockserver('mockserver/lisk_http_mocks')(req, res);
	} else {
		proxy.web(req, res, {
			target: liskCoreServerUrl,
		});
	}
});

const io = socketIo(server, {
	transports: ['websocket'],
});

const emitData = [
	[() => io.sockets.emit('blocks/change', [blocks]), 10],
	[() => io.sockets.emit('transactions/change', transactions), 2 * 10],
	[() => io.sockets.emit('rounds/change', rounds), 101 * 10],
];

emitData.forEach((emitItem) => {
	setInterval(emitItem[0], Math.ceil(emitItem[1] * eventFreqMultiplier));
});

server.listen(port, undefined, (err) => {
	if (err) logger.error(err);
	else logger.info(`Mockserver for ${mockserverName} is listening on port ${port}`);
});
