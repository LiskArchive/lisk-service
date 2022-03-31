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

const messageQueue = new Queue('Coordinator', config.endpoints.redis);

let enabledModules;

const getEnabledModules = async () => {
	if (!enabledModules) enabledModules = await requestRpc('connector', 'getRegisteredModules');
	return enabledModules;
};

const isGenesisBlockIndex = async () => {
	const isIndexed = await requestRpc('indexer', 'isGenesisBlockIndexed');
	return isIndexed;
};

const scheduleGenesisBlockIndexing = async () => {
	const { genesisHeight } = await requestRpc('indexer', 'getIndexStats');
	messageQueue.add({ height: genesisHeight });
};

const scheduleBlocksIndexing = async (blocksToIndex) => {
	blocksToIndex.forEach((height) => {
		messageQueue.add({ height });
	});
};

const init = async () => {
	// Retrieve enabled modules from connector
	await getEnabledModules();

	// Check genesis block is already indexed and schedule indexing it if not indexed
	const isGenesisBlockIndexed = await isGenesisBlockIndex();
	if (!isGenesisBlockIndexed) await scheduleGenesisBlockIndexing();

	// Check for missing blocks and schedule indexing
	const { currentChainHeight: currentHeight, genesisHeight } = await requestRpc('indexer', 'getIndexStats');
	const missingBlocksList = await requestRpc('indexer', 'getMissingBlocksList',
		{
			from: genesisHeight,
			to: currentHeight,
		});
	// Schedule block indexing
	if (missingBlocksList.length) scheduleBlocksIndexing(missingBlocksList);
};

module.exports = {
	init,
};
