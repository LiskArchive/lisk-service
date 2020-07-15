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
const logger = require('lisk-service-framework').Logger();
const { SocketClient } = require('lisk-service-framework');

const core = require('../shared/core');
const recentBlocksCache = require('../shared/recentBlocksCache');

const config = require('../config');

const coreSocket = SocketClient(config.endpoints.liskWs);
logger.info(`Registering ${config.endpoints.liskWs}`);

recentBlocksCache.init(core);

module.exports = [
	{
		name: 'block.change',
		description: 'Keep the block list up-to-date',
		controller: callback => {
			coreSocket.socket.on('blocks/change', async data => {
				logger.info(`Scheduling block list reload...`);
	
				logger.info(`Returning block list to the socket.io client...`);
				const restData = await core.getBlocks({ blockId: data.id });
				callback(restData.data[0]);
			});
		},
	},
	{
		name: 'transactions.confirmed',
		description: '',
		controller: callback => {
			coreSocket.socket.on('blocks/change', async data => {
				const emitData = await core.getBlocks({ blockId: data.id });

				if (emitData.data[0].numberOfTransactions > 0) {
					const transactionData = await core.getTransactions({ blockId: data.id });
					recentBlocksCache.addNewBlock(emitData.data[0], transactionData);
					callback(transactionData);
				} else {
					recentBlocksCache.addNewBlock(emitData.data[0], []);
				}
			});
		},
	},
	{
		name: 'round.change',
		description: '',
		controller: callback => {
			coreSocket.socket.on('round/change', async data => {
				delegateCache.init(core);
				if (data.timestamp) data.unixtime = await core.getUnixTime(data.timestamp);
				callback(data);
			});
		},
	},
];
