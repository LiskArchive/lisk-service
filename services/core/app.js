/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */

// Services
const logger = require('./services/logger')();
const core = require('./services/core');
const updaters = require('./services/updaters');
const recentBlocksCache = require('./services/recentBlocksCache');
const delegateCache = require('./services/delegateCache');
const transactionStatistics = require('./services/transactionStatistics');

// Configuration
const config = require('./config');
const SocketClient = require('./services/socketClient');

const molecler = require('./services/moleculer');

const broker = molecler.init(config);

const liskCoreAddress = config.endpoints.liskHttp;
const coreSocket = new SocketClient(config.endpoints.liskWs);
const wsApiPath = '/blockchainUpdates';
logger.info(`${wsApiPath} registered`);

config.wsEvents.forEach((event) => {
	coreSocket.socket.on(event, async (data) => {
		if (event === 'blocks/change') {
			const emitData = await core.getBlocks({ blockId: data.id });
			broker.emit(event.replace('/', '.'), emitData.data[0], 'gateway');
			recentBlocksCache.addNewBlock(emitData.data[0], data.transactions);

			if (emitData.data[0].numberOfTransactions > 0) {
				const transactionData = await core.getTransactions({ blockId: data.id });
				broker.emit('transactions.confirmed', transactionData, 'gateway');
			}
		} else {
			if (event === 'rounds/change') {
				delegateCache.init(core);
			}
			if (data.timestamp) data.unixtime = await core.getUnixTime(data.timestamp);
			broker.emit(event.replace('/', '.'), data, 'gateway');
			logger.debug(`event: ${event}, data: ${JSON.stringify(data)}`);
		}
	});
});

recentBlocksCache.init(core);
delegateCache.init(core);

transactionStatistics.init(config.transactionStatistics.historyLengthDays);
setInterval(
	transactionStatistics.updateTodayStats,
	config.transactionStatistics.updateInterval * 1000);

// Report the Lisk Core status
const CORE_DISCOVERY_INTERVAL = 10 * 1000; // ms
let logConnectStatus = true;

const checkStatus = () => {
	core.getNetworkConstants().then((result) => {
		if (typeof result.data === 'object' && result.data.version) {
			core.setProtocolVersion(result.data.protocolVersion);
			core.setReadyStatus(true);
			if (logConnectStatus) {
				logger.info(`Connected to the node ${liskCoreAddress}, Lisk Core version ${result.data.version}`);
				logConnectStatus = false;
			}
		} else {
			core.setReadyStatus(false);
			logger.warn(`The node ${liskCoreAddress} has an incompatible API or is not available at the moment.`);
			logConnectStatus = true;
		}
	}).catch(() => {
		core.setReadyStatus(false);
		logger.warn(`The node ${liskCoreAddress} not available at the moment.`);
		logConnectStatus = true;
	});
};

checkStatus();
setInterval(checkStatus, CORE_DISCOVERY_INTERVAL);

// Run Redis-based updaters
updaters();
