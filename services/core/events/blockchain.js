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
const recentBlocksCache = require('../shared/core/recentBlocksCache');
const delegateCache = require('../shared/core/delegateCache');

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
				logger.debug('Returning block list to the socket.io client...');
				const restData = await core.getBlocks({ blockId: data.id });
				callback(restData.data[0]);
			});
		},
	},
	{
		name: 'transactions.confirmed',
		description: 'Keep confirmed transaction list up-to-date',
		controller: callback => {
			coreSocket.socket.on('blocks/change', async data => {
				logger.debug('Scheduling block list reload...');
				const emitData = await core.getBlocks({ blockId: data.id });

				if (Array.isArray(emitData.data) && emitData.data.length > 0
					&& emitData.data[0].numberOfTransactions > 0) {
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
		description: 'Track round change updates',
		controller: callback => {
			coreSocket.socket.on('round/change', async data => {
				logger.debug('New round, updating delegates...');
				delegateCache.init(core);
				if (data.timestamp) data.unixtime = await core.getUnixTime(data.timestamp);
				callback(data);
			});
		},
	},
	{
		name: 'update.fee_estimates',
		description: 'Keep the fee estimates up-to-date',
		controller: callback => {
			coreSocket.socket.on('blocks/change', async () => {
				logger.debug('Returning latest fee_estimates to the socket.io client...');
				const restData = await core.getEstimateFeeByte();
				callback(restData ? restData.data : null);
			});
		},
	},
];
