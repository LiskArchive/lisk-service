/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const {
	Logger,
	SocketClient
} = require('lisk-service-framework');

const config = require('../config');
const core = require('../shared/core');
const recentBlocksCache = require('../shared/recentBlocksCache');
const delegateCache = require('../shared/delegateCache');

const logger = Logger();

module.exports = (broker) => {
	const coreSocket = SocketClient(config.endpoints.liskWs);
	logger.info(`Registering ${config.endpoints.liskWs}`);
	
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
};
