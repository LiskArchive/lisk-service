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

const {
	getEnabledModules,
	isGenesisBlockAlreadyIndexed,
	isGenesisAccountAlreadyIndexed,
	getDelegatesAccounts,
	getGenesisAccounts,
	getMissingblocks,
	getCurrentHeight,
	getGenesisHeight,
} = require('./sources/indexer');

const config = require('../config');
const Signals = require('./signals');

const blockIndexQueue = new Queue('Blocks', config.endpoints.redis);
const accountIndexQueue = new Queue('Accounts', config.endpoints.redis);

let registeredLiskModules;
const setRegisteredmodules = modules => registeredLiskModules = modules;
const getRegisteredModuleAssets = () => registeredLiskModules;

const scheduleGenesisBlockIndexing = async () => {
	const genesisHeight = await getGenesisHeight();
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

const scheduleGenesisAccountsIndexing = async (accountAddressesToIndex) => {
	accountAddressesToIndex
		.forEach((address) => accountIndexQueue
			.add({ address }));
};

const init = async () => {
	// Schedule indexing new block
	Signals.get('newBlock').add(block => scheduleNewBlockIndexing(block.header));

	// Retrieve enabled modules from connector
	setRegisteredmodules(await getEnabledModules());

	// Get all delegates and schedule indexing
	const delegates = await getDelegatesAccounts();
	if (delegates.length) {
		await scheduleDelegateAccountsIndexing(delegates);
	}

	// Check if genesis block is already indexed and schedule indexing if it is not indexed
	const isGenesisBlockIndexed = await isGenesisBlockAlreadyIndexed();
	if (!isGenesisBlockIndexed) {
		scheduleGenesisBlockIndexing();
	}

	// Check for missing blocks and schedule indexing
	const currentHeight = await getCurrentHeight();
	const genesisHeight = await getGenesisHeight();
	const listOfMssingBlocksHeight = await getMissingblocks(currentHeight, genesisHeight);

	// Schedule block indexing
	if (listOfMssingBlocksHeight.length) {
		scheduleBlocksIndexing(listOfMssingBlocksHeight);
	}

	// Schedule genesis accounts indexing
	const isGenesisAccountIndexed = await isGenesisAccountAlreadyIndexed();
	if (!isGenesisAccountIndexed) {
		const genesisAccountAddresses = await getGenesisAccounts();
		scheduleGenesisAccountsIndexing(genesisAccountAddresses);
	}
};

module.exports = {
	init,
	getRegisteredModuleAssets,
};
