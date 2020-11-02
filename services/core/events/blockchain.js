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
const Signal = require('signals');

const core = require('../shared/core');
const config = require('../config');

const coreSocket = SocketClient(config.endpoints.liskWs);
logger.info(`Registering ${config.endpoints.liskWs} for blockchain events`);

const signals = {
	blockCached: new Signal(),
};

const numOfBlocks = 202;

module.exports = [
	{
		name: 'block.change',
		description: 'Keep the block list up-to-date',
		controller: callback => {
			coreSocket.socket.on('blocks/change', async data => {
				logger.debug(`New block arrived (${data.id})...`);
				const restData = await core.getBlocks({ blockId: data.id });
				core.setLastBlock(restData.data[0]);
				signals.blockCached.dispatch(restData.data[0]);
				core.reloadBlocks(numOfBlocks);
				callback(restData.data[0]);
			});
		},
	},
	{
		name: 'transactions.confirmed',
		description: 'Keep confirmed transaction list up-to-date',
		controller: callback => {
			signals.blockCached.add(async (block) => {
				if (block.numberOfTransactions > 0) {
					logger.debug(`Block (${block.id}) arrived containing ${block.numberOfTransactions} new transactions`);
					const transactionData = await core.getTransactions({ blockId: block.id });
					callback(transactionData);
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
				core.reloadDelegateCache(core);
				if (data.timestamp) data.unixtime = await core.getUnixTime(data.timestamp);
				callback(data);
			});
		},
	},
	{
		name: 'update.fee_estimates',
		description: 'Keep the fee estimates up-to-date',
		controller: callback => {
			signals.blockCached.add(async () => {
				logger.debug('Returning latest fee_estimates to the socket.io client...');
				const restData = await core.getEstimateFeeByte();
				callback(restData ? restData.data : null);
			});
		},
	},
	{
		name: 'update.height_finalized',
		description: 'Keep the block finality height up-to-date',
		controller: callback => {
			coreSocket.socket.on('blocks/change', async () => {
				logger.debug('Returning latest heightFinalized to the socket.io client...');
				const restData = await core.updateFinalizedHeight();
				callback(restData ? restData.data : null);
			});
		},
	},
];
