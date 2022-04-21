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
const BluebirdPromise = require('bluebird');
const {
	Logger,
} = require('lisk-service-framework');

const Signals = require('../utils/signals');

const logger = Logger();

const {
	getCurrentHeight,
} = require('../constants');

const {
	getTableInstance,
} = require('../database/mysql');

const blocksIndexSchema = require('../database/schema/blocks');

const getBlocksIndex = () => getTableInstance('blocks', blocksIndexSchema);

const blockchainStore = require('../database/blockchainStore');

// Genesis height can be greater that 0
// Blockchain starts form a non-zero block height
const getGenesisHeight = () => blockchainStore.get('genesisHeight');

const getIndexStats = async () => {
	try {
		const blocksDB = await getBlocksIndex();
		const currentChainHeight = await getCurrentHeight();
		const genesisHeight = await getGenesisHeight();
		const numBlocksIndexed = await blocksDB.count();
		const [lastIndexedBlock] = await blocksDB.find({ sort: 'height:desc', limit: 1 }, ['height']);
		const chainLength = currentChainHeight - genesisHeight + 1;
		const percentage = (Math.floor(((numBlocksIndexed) / chainLength) * 10000) / 100).toFixed(2);

		return {
			currentChainHeight,
			genesisHeight,
			numBlocksIndexed,
			lastIndexedBlock,
			chainLength,
			percentage,
		};
	} catch (err) {
		logger.warn(`Error while checking index readiness: ${err.message}`);
		return { error: true };
	}
};

const reportIndexStatus = async () => {
	const {
		currentChainHeight,
		numBlocksIndexed,
		lastIndexedBlock,
		chainLength,
		percentage,
	} = await getIndexStats();

	logger.info([
		`currentChainHeight: ${currentChainHeight}`,
		`lastIndexedBlock: ${lastIndexedBlock.height}`,
	].join(', '));

	logger.info(`Block index status: ${numBlocksIndexed}/${chainLength} blocks indexed (${percentage}%) `);
};

const indexSchemas = {
	accounts: require('../database/schema/accounts'),
	blocks: require('../database/schema/blocks'),
	multisignature: require('../database/schema/multisignature'),
	transactions: require('../database/schema/transactions'),
	votes: require('../database/schema/votes'),
	votes_aggregate: require('../database/schema/votesAggregate'),
	key_value_store: require('../database/schema/keyValue'),
};

const initializeSearchIndex = async () => {
	await BluebirdPromise.map(
		Object.keys(indexSchemas),
		key => getTableInstance(key, indexSchemas[key]),
		{ concurrency: 1 },
	);
	Signals.get('searchIndexInitialized').dispatch();
};

const init = async () => {
	await initializeSearchIndex();
	setInterval(reportIndexStatus, 15 * 1000); // ms
};

module.exports = {
	getIndexStats,
	init,
};
