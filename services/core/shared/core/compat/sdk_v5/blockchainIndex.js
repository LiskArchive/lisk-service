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
} = require('./blocks');

const {
	getAccountsByAddress,
	getAccountsByPublicKey,
	getAllDelegates,
} = require('./accounts');

const {
	getBase32AddressFromPublicKey,
} = require('./accountUtils');

const {
	getVoteIndexingInfo,
	getVotesByTransactionIDs,
} = require('./voters');

const {
	getTransactionIndexingInfo,
	getTransactionsByBlockIDs,
} = require('./transactions');

const {
	triggerAccountUpdates,
	indexAccountWithData,
} = require('./accountIndex');

const {
	getDbConnection,
	getTableInstance,
	startDbTransaction,
	commitDbTransaction,
	rollbackDbTransaction,
} = require('../../../indexdb/mysql');

const keyValueDB = require('../../../indexdb/mysqlKVStore');

const legacyAccountCache = CacheRedis('legacyAccount', config.endpoints.redis);

const blocksIndexSchema = require('./schema/blocks');
const accountsIndexSchema = require('./schema/accounts');
const transactionsIndexSchema = require('./schema/transactions');
const votesIndexSchema = require('./schema/votes');
const multisignatureIndexSchema = require('./schema/multisignature');
const votesAggregateIndexSchema = require('./schema/votesAggregate');

const getAccountsIndex = () => getTableInstance('accounts', accountsIndexSchema);
const getBlocksIndex = () => getTableInstance('blocks', blocksIndexSchema);
const getMultisignatureIndex = () => getTableInstance('multisignature', multisignatureIndexSchema);
const getTransactionsIndex = () => getTableInstance('transactions', transactionsIndexSchema);
const getVotesIndex = () => getTableInstance('votes', votesIndexSchema);
const getVotesAggregateIndex = () => getTableInstance('votes_aggregate', votesAggregateIndexSchema);

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

// Last blockchain index status
const setIndexDiff = (height) => blockchainStore.set('indexStatus', height);
const getIndexDiff = () => blockchainStore.get('indexStatus');

// Key-based account update
// There is a bug that does not update public keys
const KEY_BASED_ACCOUNT_UPDATE = false;

// Key constants for the KV-store
const genesisAccountPageCached = 'genesisAccountPageCached';
const isGenesisAccountIndexingFinished = 'isGenesisAccountIndexingFinished';

const validateBlocks = (blocks) => blocks.length
	&& blocks.every(block => !!block && block.height >= 0);

const getGeneratorPkInfoArray = async (blocks) => {
	const blocksDB = await getBlocksIndex();
	const pkInfoArray = [];
	await BluebirdPromise.map(
		blocks,
		async block => {
			if (block.generatorPublicKey) {
				const [blockInfo] = await blocksDB.find({ id: block.id, limit: 1 }, ['id']);
				pkInfoArray.push({
					publicKey: block.generatorPublicKey,
					reward: block.reward,
					isForger: true,
					isBlockIndexed: !!blockInfo,
				});
			}
		},
		{ concurrency: blocks.length },
	);
	return pkInfoArray;
};

const updateProducedBlocksAndRewards = async (pkInfoArray, trx) => {
	const accountsDB = await getAccountsIndex();

	// Update producedBlocks & rewards
	if (!pkInfoArray.isBlockIndexed) {
		const incrementParam = {
			increment: {
				rewards: BigInt(pkInfoArray.reward),
				producedBlocks: 1,
			},
			where: {
				property: 'address',
				value: getBase32AddressFromPublicKey(pkInfoArray.publicKey),
			},
		};

		// If no rows are affected with increment, insert the row
		const numRowsAffected = await accountsDB.increment(incrementParam, trx);
		if (numRowsAffected === 0) {
			await accountsDB.upsert({
				address: getBase32AddressFromPublicKey(pkInfoArray.publicKey),
				publicKey: pkInfoArray.publicKey,
				producedBlocks: 1,
				rewards: pkInfoArray.reward,
			}, trx);
		}
	}
};

const updateVoteAggregatesTrx = async (voteToAggregate, trx) => {
	const votesAggregateDB = await getVotesAggregateIndex();

	const incrementParam = {
		increment: {
			amount: BigInt(voteToAggregate.amount),
		},
		where: {
			property: 'id',
			value: voteToAggregate.id,
		},
	};

	const numRowsAffected = await votesAggregateDB.increment(incrementParam, trx);
	if (numRowsAffected === 0) {
		await votesAggregateDB.upsert(voteToAggregate.voteObject, trx);
	}
};

const ensureArray = (e) => Array.isArray(e) ? e : [e];

const indexBlock = async job => {
	const { height } = job.data;

	const blocksDB = await getBlocksIndex();
	const blocks = await getBlockByHeight(height);
	const connection = await getDbConnection();
	const trx = await startDbTransaction(connection);

	logger.debug(`Created new MySQL transaction to index block at height ${height}`);

	if (!validateBlocks(blocks)) throw new Error(`Error: Invalid block ${height} }`);
	try {
		const transactionsDB = await getTransactionsIndex();
		const votesDB = await getVotesIndex();
		const multisignatureDB = await getMultisignatureIndex();
		const { votes, votesToAggregateArray } = await getVoteIndexingInfo(blocks);
		const {
			accounts: accountsFromTransactions,
			transactions,
			multisignatureInfoToIndex,
		} = await getTransactionIndexingInfo(blocks);

		const generatorPkInfoArray = await getGeneratorPkInfoArray(blocks);
		const accountsByPublicKey = await getAccountsByPublicKey(generatorPkInfoArray);
		ensureArray(accountsByPublicKey).forEach(a => indexAccountWithData(a));
		ensureArray(accountsFromTransactions).forEach(a => indexAccountWithData(a));
		if (transactions.length) await transactionsDB.upsert(transactions, trx);
		if (multisignatureInfoToIndex.length) await multisignatureDB
			.upsert(multisignatureInfoToIndex, trx);
		if (votes.length) await votesDB.upsert(votes, trx);

		await BluebirdPromise.map(generatorPkInfoArray,
			generatorProps => updateProducedBlocksAndRewards(generatorProps, trx), { concurrency: 1 });
		await BluebirdPromise.map(votesToAggregateArray,
			voteToAggregate => updateVoteAggregatesTrx(voteToAggregate, trx), { concurrency: 1 });

		if (blocks.length) await blocksDB.upsert(blocks, trx);
		await commitDbTransaction(trx);
	} catch (error) {
		await rollbackDbTransaction(trx);
		logger.debug(`Rolled back MySQL transaction to index block at height ${height}`);

		if (error.message.includes('ER_LOCK_DEADLOCK')) {
			throw new Error(`Deadlock encountered while indexing block at height ${height}. Will retry later.`);
		}
		throw error;
	}
};


const updateBlockIndex = async job => {
	const blocksDB = await getBlocksIndex();
	const { blocks } = job.data;
	await blocksDB.upsert(blocks);
};

const deleteIndexedBlocks = async job => {
	const blocksDB = await getBlocksIndex();
	const connection = await getDbConnection();
	const trx = await startDbTransaction(connection);
	try {
		const accountsDB = await getAccountsIndex();
		const transactionsDB = await getTransactionsIndex();
		const votesDB = await getVotesIndex();
		const { blocks } = job.data;
		const generatorPkInfoArray = await getGeneratorPkInfoArray(blocks);
		const accountsByPublicKey = await getAccountsByPublicKey(generatorPkInfoArray);
		if (accountsByPublicKey.length) await accountsDB.upsert(accountsByPublicKey, trx);
		const forkedTransactionIDs = await getTransactionsByBlockIDs(blocks.map(b => b.id));
		const forkedVotes = await getVotesByTransactionIDs(forkedTransactionIDs);
		await transactionsDB.deleteIds(forkedTransactionIDs, trx);
		await votesDB.deleteIds(forkedVotes.map(v => v.tempId), trx);

		// Update producedBlocks & rewards
		await BluebirdPromise.map(
			generatorPkInfoArray,
			async pkInfoArray => {
				await accountsDB.decrement({
					decrement: {
						rewards: BigInt(pkInfoArray.reward),
						producedBlocks: 1,
					},
					where: {
						property: 'address',
						value: getBase32AddressFromPublicKey(pkInfoArray.publicKey),
					},
				}, trx);
			});
		await blocksDB.deleteIds(blocks.map(b => b.height), trx);
		await commitDbTransaction(trx);
	} catch (error) {
		await rollbackDbTransaction(trx);
		throw error;
	}
};

// Initialize queues
const indexBlocksQueue = Queue('indexBlocksQueue', indexBlock, 30);
const updateBlockIndexQueue = Queue('updateBlockIndexQueue', updateBlockIndex, 1);
const deleteIndexedBlocksQueue = Queue('deleteIndexedBlocksQueue', deleteIndexedBlocks, 1);

const verifyAndIndexBlock = async data => {
	const { block } = data.data;

	logger.info(`Indexing new block: ${block.id} at height ${block.height}`);

	const blocksDB = await getBlocksIndex();
	const [blockInfo] = await blocksDB.find({ height: block.height, limit: 1 }, ['id', 'isFinal']);
	if (!blockInfo || (!blockInfo.isFinal && block.isFinal)) {
		// Index if doesn't exist, or update if it isn't set to final
		await indexBlocksQueue.add({ height: block.height });

		// Update block finality status
		const finalizedBlockHeight = await getFinalizedHeight();
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
			await deleteIndexedBlocksQueue.add({ blocks: blocksToRemove });
		}
	}
};

const verifyBlocksQueue = Queue('verifyBlocksQueue', verifyAndIndexBlock, 1);

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
	const accountsDB = await getAccountsIndex();

	const [genesisBlock] = await getBlockByHeight(await getGenesisHeight(), true);
	const genesisAccountsToIndex = genesisBlock.asset.accounts
		.filter(account => account.address.length === 40)
		.map(account => account.address);

	logger.info(`${genesisAccountsToIndex.length} registered accounts found in the genesis block`);

	const lastCachedPage = await keyValueDB.get(genesisAccountPageCached) || 0;

	const PAGE_SIZE = 1000;
	const NUM_PAGES = Math.ceil(genesisAccountsToIndex.length / PAGE_SIZE);
	for (let pageNum = 0; pageNum < NUM_PAGES; pageNum++) {
		/* eslint-disable no-await-in-loop */
		const currentPage = pageNum * PAGE_SIZE;
		const nextPage = (pageNum + 1) * PAGE_SIZE;
		const percentage = (Math.round(((pageNum + 1) / NUM_PAGES) * 1000) / 10).toFixed(1);

		if (pageNum >= lastCachedPage) {
			const genesisAccountAddressesToIndex = genesisAccountsToIndex.slice(currentPage, nextPage);

			logger.info(`Attempting retrieval of genesis accounts batch ${pageNum + 1}/${NUM_PAGES} (${percentage}%)`);

			const accounts = await getAccountsByAddress(genesisAccountAddressesToIndex, true);
			if (accounts.length) await accountsDB.upsert(accounts);
			await keyValueDB.set(genesisAccountPageCached, pageNum);

			// Update MySQL based KV-store to avoid re-indexing of the genesis accounts
			// after applying the DB snapshots
			if (pageNum === NUM_PAGES - 1) {
				logger.info('Setting genesis account indexing completion status');
				await keyValueDB.set(isGenesisAccountIndexingFinished, true);
			}
		} else {
			logger.info(`Skipping retrieval of genesis accounts batch ${pageNum + 1}/${NUM_PAGES} (${percentage}%)`);
		}
		/* eslint-enable no-await-in-loop */
	}
};

const indexGenesisAccounts = async () => {
	if (await keyValueDB.get(isGenesisAccountIndexingFinished)) {
		logger.info('Skipping genesis account index update (one-time operation, already indexed)');
		return;
	}

	try {
		// Ensure genesis accounts indexing continues even after the Api client is re-instantiated
		// Remove the listener after the genesis accounts are successfully indexed
		logger.info('Attempting to update genesis account index (one-time operation)');
		Signals.get('newApiClient').add(performGenesisAccountsIndexing);
		await performGenesisAccountsIndexing();
		Signals.get('newApiClient').remove(performGenesisAccountsIndexing);
	} catch (err) {
		logger.fatal('Critical error: Unable to index Genesis block accounts batch. Will retry after the restart');
		logger.fatal(err.message);
		process.exit(1);
	}
};

const indexAllDelegateAccounts = async () => {
	const accountsDB = await getAccountsIndex();
	const allDelegatesInfo = await getAllDelegates();
	const allDelegateAddresses = allDelegatesInfo.data.map(({ address }) => address);
	const PAGE_SIZE = 1000;
	for (let i = 0; i < Math.ceil(allDelegateAddresses.length / PAGE_SIZE); i++) {
		/* eslint-disable no-await-in-loop */
		const accounts = await getAccountsByAddress(allDelegateAddresses
			.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE));
		await accountsDB.upsert(accounts);
		/* eslint-enable no-await-in-loop */
	}
	logger.info(`Indexed ${allDelegateAddresses.length} delegate accounts`);
};

const deleteBlock = async (block) => deleteIndexedBlocksQueue.add({ blocks: [block] });

const buildIndex = async (from, to) => {
	if (from > to) {
		logger.warn(`Invalid interval of blocks to index: ${from} -> ${to}`);
		return;
	}

	const MAX_BLOCKS_LIMIT_PP = 1; // 1 block at a time
	const numOfPages = Math.ceil((to + 1) / MAX_BLOCKS_LIMIT_PP - from / MAX_BLOCKS_LIMIT_PP);

	for (let pageNum = 0; pageNum < numOfPages; pageNum++) {
		/* eslint-disable no-await-in-loop */
		const pseudoOffset = to - (MAX_BLOCKS_LIMIT_PP * (pageNum + 1));
		const offset = pseudoOffset >= from ? pseudoOffset : from - 1;
		const batchFromHeight = offset + 1;
		const batchToHeight = (offset + MAX_BLOCKS_LIMIT_PP) <= to
			? (offset + MAX_BLOCKS_LIMIT_PP) : to;
		const percentage = (((pageNum + 1) / numOfPages) * 100).toFixed(1);
		logger.debug(`Scheduling retrieval of blocks ${batchFromHeight}-${batchToHeight} (${percentage}%)`);

		for (let height = batchFromHeight; height <= batchToHeight; height++) {
			await indexBlocksQueue.add({ height });
		}
		/* eslint-enable no-await-in-loop */
	}
	logger.info(`Finished scheduling the block index build (${from}-${to})`);
};

const indexNewBlocks = async blocks => blocks.data.forEach(async block => {
	await verifyBlocksQueue.add({ block });
});

const findMissingBlocksInRange = async (fromHeight, toHeight) => {
	let result = [];

	const totalNumOfBlocks = toHeight - fromHeight + 1;
	logger.info(`Checking for missing blocks between height ${fromHeight}-${toHeight} (${totalNumOfBlocks} blocks)`);

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
	} else if (indexedBlockCount !== totalNumOfBlocks) {
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

const indexMissingBlocks = async (params = {}) => {
	const genesisHeight = await getGenesisHeight();
	const currentHeight = await getCurrentHeight();

	// Missing blocks are being checked during start
	// By default they are checked from the blockchain's beginning
	// The param force: true skips the getIndexVerifiedHeight
	// and makes it check the whole index
	let lastScheduledBlock = await getIndexVerifiedHeight() || genesisHeight;
	if (params.force === true) lastScheduledBlock = genesisHeight;

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

const validateIndexReadiness = async ({ strict } = {}) => {
	const { numBlocksIndexed, chainLength } = await getIndexStats();
	const chainLenToConsider = strict === true ? chainLength : chainLength - 1;
	return numBlocksIndexed >= chainLenToConsider;
};

const checkIndexReadiness = async () => {
	if (!await getIndexReadyStatus() // status is set only once
		&& await validateIndexReadiness()) { // last block is being indexed atm
		await setIndexReadyStatus(true);
		logger.info('The blockchain index is complete');
		logger.debug(`'blockIndexReady' signal: ${Signals.get('blockIndexReady')}`);
		Signals.get('blockIndexReady').dispatch(true);
	}
};

const fixMissingBlocks = async () => {
	const { numBlocksIndexed } = await getIndexStats();
	if (!await validateIndexReadiness({ strict: true })) {
		const prevIndex = await getIndexDiff();
		const minTolerableDiff = 0;
		const maxDiff = 1000;
		const currentDiff = numBlocksIndexed - prevIndex;

		if (currentDiff > minTolerableDiff
			&& currentDiff < maxDiff) { // maxDiff because we don't need to run it when index is not ready
			logger.info(`Detected block discrepancy (${currentDiff} missing blocks)`);
			await indexMissingBlocks({ force: true });
		}
	}
	await setIndexDiff(numBlocksIndexed);
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
	accounts: require('./schema/accounts'),
	blocks: require('./schema/blocks'),
	multisignature: require('./schema/multisignature'),
	transactions: require('./schema/transactions'),
	votes: require('./schema/votes'),
	votes_aggregate: require('./schema/votesAggregate'),
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
	// Index every new incoming block
	const indexNewBlocksListener = async (data) => { await indexNewBlocks(data); };
	Signals.get('newBlock').add(indexNewBlocksListener);
	Signals.get('newBlock').add(checkIndexReadiness);
	Signals.get('newBlock').add(updateFinalizedHeight);
	setInterval(reportIndexStatus, 15 * 1000); // ms
	setInterval(fixMissingBlocks, 15 * 60 * 1000); // ms

	// Enable rewards and produced blocks in get.accounts
	if (config.indexNumOfBlocks === 0) setIsSyncFullBlockchain(true);

	// Check state of index and perform update
	try {
		// Download genesis block
		await getBlockByHeight(await getGenesisHeight());

		// Start the indexing process (accounts)
		await indexGenesisAccounts();
		await cacheLegacyAccountInfo();

		// Index all the delegate accounts first
		await indexAllDelegateAccounts();

		// Start the previously scheduled account updates
		await triggerAccountUpdates();

		// Start the indexing process (blocks)
		await indexMissingBlocks();
		await updateNonFinalBlocks();

		if (KEY_BASED_ACCOUNT_UPDATE === true) {
			setInterval(triggerAccountUpdates, 15 * 1000); // ms
		}

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
	initializeSearchIndex,
	indexMissingBlocks,
};
