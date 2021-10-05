/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
	CacheRedis,
	Logger,
} = require('lisk-service-framework');

const BluebirdPromise = require('bluebird');

const logger = Logger();

const config = require('../../../../config');
const Signals = require('../../../signals');
const Queue = require('../../queue');

const {
	getIndexReadyStatus,
	setIndexReadyStatus,
	setIsSyncFullBlockchain, // To get rewards and produced blocks
} = require('../common');

const {
	getCurrentHeight,
	getBlockByHeight,
	getBlocksByHeightBetween,
} = require('./blocks');

const {
	indexAccountsbyAddress,
	indexAccountsbyPublicKey,
	getAllDelegates,
} = require('./accounts');

const {
	indexVotes,
} = require('./voters');

const {
	indexTransactions,
	removeTransactionsByBlockIDs,
} = require('./transactions');

const legacyAccountCache = CacheRedis('legacyAccount', config.endpoints.redis);
const genesisAccountsCache = CacheRedis('genesisAccounts', config.endpoints.redis);

const mysqlIndex = require('../../../indexdb/mysql');
const blocksIndexSchema = require('./schema/blocks');

const getBlocksIndex = () => mysqlIndex('blocks', blocksIndexSchema);

const blockchainStore = require('./blockchainStore');

// Genesis height can be greater that 0
// Blockchain starts form a non-zero block height
const getGenesisHeight = () => blockchainStore.get('genesisHeight');

// The top final block
const setFinalizedHeight = (height) => blockchainStore.set('finalizedHeight', height);
const getFinalizedHeight = () => blockchainStore.get('finalizedHeight');

// Height below which there are no missing blocks in the index
const setIndexVerifiedHeight = (height) => blockchainStore.set('indexVerifiedHeight', height);
const getIndexVerifiedHeight = () => blockchainStore.get('indexVerifiedHeight');

const validateBlocks = (blocks) => blocks.length
	&& blocks.every(block => !!block && block.height >= 0);

const indexBlocks = async job => {
	const blocks = await getBlocksByHeightBetween(job.data.from, job.data.to);

	if (!validateBlocks(blocks)) throw new Error(`Error: Invalid blocks ${job.data.from}-${job.data.to} }`);

	const blocksDB = await getBlocksIndex();
	const generatorPkInfoArray = [];
	await BluebirdPromise.map(
		blocks,
		async block => {
			if (block.generatorPublicKey) {
				const [blockInfo] = await blocksDB.find({ id: block.id, limit: 1 }, ['id']);
				generatorPkInfoArray.push({
					publicKey: block.generatorPublicKey,
					reward: block.reward,
					isForger: true,
					isBlockIndexed: !!blockInfo,
				});
			}
		},
		{ concurrency: blocks.length },
	);
	await blocksDB.upsert(blocks);
	await indexAccountsbyPublicKey(generatorPkInfoArray);
	await indexTransactions(blocks);
	await indexVotes(blocks);
};

const updateBlockIndex = async job => {
	const { blocks } = job.data;
	const blocksDB = await getBlocksIndex();
	await blocksDB.upsert(blocks);
};

const deleteIndexedBlocks = async job => {
	const { blocks } = job.data;
	const blocksDB = await getBlocksIndex();
	const generatorPkInfoArray = [];
	blocks.forEach(async block => {
		if (block.generatorPublicKey) generatorPkInfoArray.push({
			publicKey: block.generatorPublicKey,
			reward: block.reward,
			isForger: true,
			isDeleteBlock: true,
		});
	});
	await indexAccountsbyPublicKey(generatorPkInfoArray);
	await removeTransactionsByBlockIDs(blocks.map(b => b.id));
	await blocksDB.deleteIds(blocks.map(b => b.height));
};

// Initialize queues
const indexBlocksQueue = Queue('indexBlocksQueue', indexBlocks, 4);
const updateBlockIndexQueue = Queue('updateBlockIndexQueue', updateBlockIndex, 1);
const deleteIndexedBlocksQueue = Queue('deleteIndexedBlocksQueue', deleteIndexedBlocks, 1);

const cacheLegacyAccountInfo = async () => {
	// Cache the legacy account reclaim balance information
	const [genesisBlock] = await getBlockByHeight(await getGenesisHeight(), true);
	const unregisteredAccounts = genesisBlock.asset.accounts
		.filter(account => account.address.length !== 40);

	logger.info(`${unregisteredAccounts.length} unregistered accounts found in the genesis block`);
	logger.info('Starting to cache legacy account reclaim balance information');
	await BluebirdPromise.map(
		unregisteredAccounts,
		async account => {
			const legacyAccountInfo = {
				address: account.address,
				balance: account.token.balance,
			};
			await legacyAccountCache.set(account.address, JSON.stringify(legacyAccountInfo));
		},
		{ concurrency: 1000 },
	);
	logger.info('Finished caching legacy account reclaim balance information');
};

const performGenesisAccountsIndexing = async () => {
	const [genesisBlock] = await getBlockByHeight(await getGenesisHeight(), true);

	const genesisAccountsToIndex = genesisBlock.asset.accounts
		.filter(account => account.address.length === 40)
		.map(account => account.address);
	const genesisAccountPageCached = 'genesisAccountPageCached';

	logger.info(`${genesisAccountsToIndex.length} registered accounts found in the genesis block`);

	const lastCachedPage = await genesisAccountsCache.get(genesisAccountPageCached) || 0;

	const PAGE_SIZE = 1000;
	const NUM_PAGES = Math.ceil(genesisAccountsToIndex.length / PAGE_SIZE);
	for (let pageNum = 0; pageNum < NUM_PAGES; pageNum++) {
		const currentPage = pageNum * PAGE_SIZE;
		const nextPage = (pageNum + 1) * PAGE_SIZE;
		const percentage = (Math.round(((pageNum + 1) / NUM_PAGES) * 1000) / 10).toFixed(1);

		if (pageNum >= lastCachedPage) {
			const genesisAccountAddressesToIndex = genesisAccountsToIndex.slice(currentPage, nextPage);

			logger.info(`Scheduling retrieval of genesis accounts batch ${pageNum + 1}/${NUM_PAGES} (${percentage}%)`);

			/* eslint-disable no-await-in-loop */
			await indexAccountsbyAddress(genesisAccountAddressesToIndex, true);
			await genesisAccountsCache.set(genesisAccountPageCached, pageNum);
			/* eslint-enable no-await-in-loop */
		} else {
			logger.info(`Skipping retrieval of genesis accounts batch ${pageNum + 1}/${NUM_PAGES} (${percentage}%)`);
		}
	}
};

const indexGenesisAccounts = async () => {
	const isScheduled = await genesisAccountsCache.get('isGenesisAccountIndexingScheduled');

	if (isScheduled === true) {
		logger.info('Skipping genesis account index update (one-time operation, already indexed)');
		return;
	}

	try {
		logger.info('Attempting to update genesis account index (one-time operation)');
		await performGenesisAccountsIndexing();
		await genesisAccountsCache.set('isGenesisAccountIndexingScheduled', true);
		await genesisAccountsCache.set('genesisAccountPageCached', 0);
	} catch (err) {
		logger.fatal('Critical error: Unable to index Genesis block accounts batch. Will retry after the restart');
		logger.fatal(err.message);
		process.exit(1);
	}
};

const indexAllDelegateAccounts = async () => {
	const allDelegatesInfo = await getAllDelegates();
	const allDelegateAddresses = allDelegatesInfo.data.map(({ address }) => address);
	const PAGE_SIZE = 1000;
	for (let i = 0; i < Math.ceil(allDelegateAddresses.length / PAGE_SIZE); i++) {
		// eslint-disable-next-line no-await-in-loop
		await indexAccountsbyAddress(allDelegateAddresses.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE));
	}
	logger.info(`Indexed ${allDelegateAddresses.length} delegate accounts`);
};

const deleteBlock = async (block) => deleteIndexedBlocksQueue.add({ blocks: [block] });

const buildIndex = async (from, to) => {
	if (from > to) {
		logger.warn(`Invalid interval of blocks to index: ${from} -> ${to}`);
		return;
	}

	const MAX_BLOCKS_LIMIT_PP = 100;
	const numOfPages = Math.ceil((to + 1) / MAX_BLOCKS_LIMIT_PP - from / MAX_BLOCKS_LIMIT_PP);

	for (let pageNum = 0; pageNum < numOfPages; pageNum++) {
		/* eslint-disable no-await-in-loop */
		const pseudoOffset = to - (MAX_BLOCKS_LIMIT_PP * (pageNum + 1));
		const offset = pseudoOffset > from ? pseudoOffset : from - 1;
		const batchFromHeight = offset + 1;
		const batchToHeight = (offset + MAX_BLOCKS_LIMIT_PP) <= to
			? (offset + MAX_BLOCKS_LIMIT_PP) : to;
		const percentage = (((pageNum + 1) / numOfPages) * 100).toFixed(1);
		logger.debug(`Scheduling retrieval of blocks ${batchFromHeight}-${batchToHeight} (${percentage}%)`);

		await indexBlocksQueue.add({ from: batchFromHeight, to: batchToHeight });
		/* eslint-enable no-await-in-loop */
	}
	logger.info(`Finished scheduling the block index build (${from}-${to})`);
};

const indexNewBlocks = async blocks => {
	const blocksDB = await getBlocksIndex();
	if (blocks.data.length === 1) {
		const [block] = blocks.data;
		logger.info(`Indexing new block: ${block.id} at height ${block.height}`);

		const [blockInfo] = await blocksDB.find({ height: block.height, limit: 1 }, ['id', 'isFinal']);
		if (!blockInfo || (!blockInfo.isFinal && block.isFinal)) {
			// Index if doesn't exist, or update if it isn't set to final
			await indexBlocksQueue.add({ from: block.height, to: block.height });

			// Update block finality status
			const finalizedBlockHeight = getFinalizedHeight();
			const nonFinalBlocks = await blocksDB.find({ isFinal: false, limit: 1000 },
				Object.keys(blocksIndexSchema.schema));
			await updateBlockIndexQueue.add({
				blocks: nonFinalBlocks
					.filter(b => b.height <= finalizedBlockHeight)
					.map(b => ({ ...b, isFinal: true })),
			});

			if (blockInfo && blockInfo.id !== block.id) {
				// Fork detected

				const [highestIndexedBlock] = await blocksDB.find({ sort: 'height:desc', limit: 1 }, ['height']);
				const blocksToRemove = await blocksDB.find({
					propBetweens: [{
						property: 'height',
						from: block.height + 1,
						to: highestIndexedBlock.height,
					}],
					limit: highestIndexedBlock.height - block.height,
				}, ['id']);
				const blockIDsToRemove = blocksToRemove.map(b => b.id);
				await blocksDB.deleteIds(blockIDsToRemove);

				// Remove transactions in the forked blocks
				await removeTransactionsByBlockIDs(blockIDsToRemove);
			}
		}
	}
};

const findMissingBlocksInRange = async (fromHeight, toHeight) => {
	let result = [];

	const heightDifference = toHeight - fromHeight;
	logger.info(`Checking for missing blocks between height ${fromHeight}-${toHeight} (${heightDifference} blocks)`);

	const blocksDB = await getBlocksIndex();
	const propBetweens = [{
		property: 'height',
		from: fromHeight,
		to: toHeight,
	}];
	const indexedBlockCount = await blocksDB.count({ propBetweens });

	// This block helps determine empty index
	if (indexedBlockCount < 3) {
		result = [{ from: fromHeight, to: toHeight }];
	} else if (indexedBlockCount !== heightDifference) {
		const missingBlocksQueryStatement = `
			SELECT
				(SELECT COALESCE(MAX(b0.height), ${fromHeight}) FROM blocks b0 WHERE b0.height < b1.height) AS 'from',
				(b1.height - 1) AS 'to'
			FROM blocks b1
			WHERE b1.height BETWEEN ${fromHeight} + 1 AND ${toHeight}
				AND b1.height != ${toHeight}
				AND NOT EXISTS (SELECT 1 FROM blocks b2 WHERE b2.height = b1.height - 1)
		`;

		const missingBlockRanges = await blocksDB.rawQuery(missingBlocksQueryStatement);

		result = missingBlockRanges;
	}

	const logContent = result.map(o => `${o.from}-${o.to} (${o.to - o.from + 1} blocks)`);
	logContent.forEach(o => logger.info(`Missing blocks in range: ${o}`));

	return result;
};

const getLastFinalBlockHeight = async () => {
	// Returns the highest finalized block available within the index
	// If index empty, default lastIndexedHeight (alias for height) to blockIndexLowerRange
	const blocksDB = await getBlocksIndex();

	const [{ height: lastIndexedHeight } = {}] = await blocksDB.find({
		sort: 'height:desc',
		limit: 1,
		isFinal: true,
	}, ['height']);

	return lastIndexedHeight;
};

const getNonFinalHeights = async () => {
	const blocksDB = await getBlocksIndex();

	const [{ height: lastIndexedHeight } = {}] = await blocksDB.find({
		sort: 'height:asc',
		limit: 5000,
		isFinal: false,
	}, ['height']);

	return lastIndexedHeight || [];
};

const indexMissingBlocks = async () => {
	const genesisHeight = await getGenesisHeight();
	const currentHeight = await getCurrentHeight();

	// Missing blocks are being checked during start
	// By default they are checked from the blockchain's beginning
	// It is possible to resume indexing from the last safe height
	// Uncomment the line below to (slightly) increase performance during start
	const lastScheduledBlock = await getIndexVerifiedHeight() || genesisHeight;
	// const lastScheduledBlock = genesisHeight;
	const minReqHeight = config.indexNumOfBlocks > 0
		? currentHeight - config.indexNumOfBlocks : genesisHeight;

	// Lowest and highest block heights expected to be indexed
	const blockIndexHigherRange = currentHeight;
	const blockIndexLowerRange = Math.max(minReqHeight, lastScheduledBlock);

	// Retrieve the list of missing blocks
	const missingBlockRanges = await findMissingBlocksInRange(
		blockIndexLowerRange, blockIndexHigherRange);

	// Start building the block index
	try {
		if (missingBlockRanges.length === 0) {
			// Update 'indexVerifiedHeight' when no missing blocks are found
			const indexVerifiedHeight = await getIndexVerifiedHeight();
			await setIndexVerifiedHeight(Math.max(indexVerifiedHeight, blockIndexHigherRange));
		} else {
			for (let i = 0; i < missingBlockRanges.length; i++) {
				const { from, to } = missingBlockRanges[i];

				logger.info(`Attempting to cache missing blocks ${from}-${to} (${to - from + 1} blocks)`);
				/* eslint-disable-next-line no-await-in-loop */
				await buildIndex(from, to);
				/* eslint-disable-next-line no-await-in-loop */
				await setIndexVerifiedHeight(to + 1);
			}
		}
	} catch (err) {
		logger.warn(`Missed blocks indexing failed due to: ${err.message}`);
	}
};

const updateNonFinalBlocks = async () => {
	const cHeight = await getCurrentHeight();
	const nfHeights = await getNonFinalHeights();

	if (nfHeights.length > 0) {
		logger.info(`Re-indexing ${nfHeights.length} non-finalized blocks in the search index database`);
		await buildIndex(nfHeights[0].height, cHeight);
	}
};

const updateFinalizedHeight = async () => setFinalizedHeight(await getLastFinalBlockHeight());

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

const checkIndexReadiness = async () => {
	logger.debug('Checking blocks index ready status');

	const {
		numBlocksIndexed,
		chainLength,
	} = await getIndexStats();

	const status = await getIndexReadyStatus();

	if (!status // status is set only once
		&& numBlocksIndexed >= chainLength - 1) { // last block is being indexed atm
		await setIndexReadyStatus(true);
		logger.info('The blockchain index is complete');
		logger.debug(`'blockIndexReady' signal: ${Signals.get('blockIndexReady')}`);
		Signals.get('blockIndexReady').dispatch(true);
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

const init = async () => {
	// Index every new incoming block
	const indexNewBlocksListener = async (data) => { await indexNewBlocks(data); };
	Signals.get('newBlock').add(indexNewBlocksListener);
	Signals.get('newBlock').add(checkIndexReadiness);
	Signals.get('newBlock').add(updateFinalizedHeight);
	setInterval(reportIndexStatus, 15 * 1000); // ms

	// Enable rewards and produced blocks in get.accounts
	if (config.indexNumOfBlocks === 0) setIsSyncFullBlockchain(true);

	// Check state of index and perform update
	try {
		// Start the indexing process (blocks)
		await indexMissingBlocks();
		await updateNonFinalBlocks();

		// Start the indexing process (accounts)
		await indexAllDelegateAccounts();
		await cacheLegacyAccountInfo();
		await indexGenesisAccounts();

		logger.info('Finished all blockchain index startup tasks');
	} catch (err) {
		logger.warn(`Unable to update block index:\n${err.stack}`);
	}
};

module.exports = {
	init,
	getLastFinalBlockHeight,
	getIndexStats,
	deleteBlock,
};
