/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
const MessageQueue = require('bull');

const { indexGenesisAccounts } = require('./indexer/accountIndex');
const { indexNewBlock, addBlockToQueue } = require('./indexer/blockchainIndex');
const { getGenesisHeight } = require('./constants');

const config = require('../config');

const messageQueue = new MessageQueue('Coordinator', config.endpoints.redisCoordinator);

messageQueue.process(async (job) => {
	const genesisHeight = await getGenesisHeight();

	const { height, isNewBlock } = job.data;

	if (isNewBlock) {
		await indexNewBlock(height);
	} else {
		await addBlockToQueue(height);
	}

	// Index genesis accounts if height of block is genesis height
	if (height === genesisHeight) {
		await indexGenesisAccounts();
	}
});
