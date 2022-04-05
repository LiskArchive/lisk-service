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

const {
	indexGenesisAccounts,
	buildLegacyAccountCache,
	addAccountToAddrUpdateQueue,
} = require('./indexer/accountIndex');

const {
	indexNewBlock,
	addBlockToQueue,
} = require('./indexer/blockchainIndex');
const status = require('./indexer/indexStatus');

const { getGenesisHeight } = require('./constants');

const config = require('../config');

const blockIndexQueue = new MessageQueue('Blocks', config.endpoints.redisCoordinator);
const accountIndexQueue = new MessageQueue('Accounts', config.endpoints.redisCoordinator);

let isLegacyAccountCached = false;

const initProcess = async () => {
	blockIndexQueue.process(async (job) => {
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

	accountIndexQueue.process(async (job) => {
		if (!isLegacyAccountCached) {
			await buildLegacyAccountCache();
			isLegacyAccountCached = true;
		}

		const { accountAddress } = job.data;
		await addAccountToAddrUpdateQueue(accountAddress);
	});
};

const init = async () => {
	await status.init();
	await initProcess();
};

module.exports = {
	init,
};
