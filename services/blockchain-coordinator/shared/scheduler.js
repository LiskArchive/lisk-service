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
const Queue = require('bull');
const { requestRpc } = require('./utils/appContext');

const config = require('../config');
const Signals = require('./signals');

const blockIndexQueue = new Queue('Blocks', config.endpoints.redis);
const accountIndexQueue = new Queue('Accounts', config.endpoints.redis);

let enabledModules;

const getEnabledModules = async () => {
	if (!enabledModules) {
		enabledModules = await requestRpc('connector', 'getRegisteredModules');
	}
	return enabledModules;
};

const isGenesisBlockIndex = async () => {
	const isIndexed = await requestRpc('indexer', 'isGenesisBlockIndexed');
	return isIndexed;
};

const scheduleGenesisBlockIndexing = async () => {
	const { genesisHeight } = await requestRpc('indexer', 'getIndexStats');
	blockIndexQueue.add({ height: genesisHeight });
};

const scheduleBlocksIndexing = async (blocksHeightToIndex) => {
	blocksHeightToIndex
		.forEach((height) => blockIndexQueue
			.add({ height }));
};

const scheduleNewBlockIndexing = async (block) => blockIndexQueue
	.add({ height: block.height, isNewBlock: true });

const scheduleDelegateAccountsIndexing = async (addresses) => {
	addresses
		.forEach((address) => accountIndexQueue
			.add({ address }));
};

const init = async () => {
	// Get all delegates and schedule indexing
	const delegates = await requestRpc('indexer', 'getDelegateAccounts');
	if (delegates.length) {
		await scheduleDelegateAccountsIndexing(delegates);
	}

	// Schedule indexing new block
	Signals.get('newBlock').add(block => scheduleNewBlockIndexing(block.header));

	// Retrieve enabled modules from connector
	await getEnabledModules();

	// Check if genesis block is already indexed and schedule indexing if it is not indexed
	const isGenesisBlockIndexed = await isGenesisBlockIndex();
	if (!isGenesisBlockIndexed) {
		scheduleGenesisBlockIndexing();
	}

	// Retrieve current height
	const {
		currentChainHeight: currentHeight,
		genesisHeight,
	} = await requestRpc('indexer', 'getIndexStats');

	// Check for missing blocks and schedule indexing
	const listOfMssingBlocksHeight = await requestRpc('indexer', 'getMissingBlocks',
		{
			from: genesisHeight,
			to: currentHeight,
		});

	// Schedule block indexing
	if (listOfMssingBlocksHeight.length) {
		scheduleBlocksIndexing(listOfMssingBlocksHeight);
	}
};

module.exports = {
	init,
};
