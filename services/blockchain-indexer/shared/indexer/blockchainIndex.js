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
const {
	Logger,
	Queue,
} = require('lisk-service-framework');

const BluebirdPromise = require('bluebird');

const logger = Logger();

const config = require('../../config');

const {
	getBlockByHeight,
} = require('../blocks');

const {
	getAccountsByPublicKey,
} = require('../accounts');

const {
	getBase32AddressFromPublicKey,
} = require('../utils/accountUtils');

const {
	getVotesByTransactionIDs,
} = require('../voters');

const {
	getVoteIndexingInfo,
} = require('./votersIndex');

const {
	getTransactionsByBlockIDs,
} = require('../transactions');

const {
	getTransactionIndexingInfo,
} = require('./transactionIndex');

const {
	indexAccountByPublicKey,
	indexAccountByAddress,
	indexAccountWithData,
} = require('./accountIndex');

const {
	getFinalizedHeight,
	getCurrentHeight,
	getGenesisHeight,
} = require('../constants');

const {
	getDbConnection,
	getTableInstance,
	startDbTransaction,
	commitDbTransaction,
	rollbackDbTransaction,
} = require('../database/mysql');

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

const blockchainStore = require('../database/blockchainStore');

// Key-based account update
// There is a bug that does not update public keys
const KEY_BASED_ACCOUNT_UPDATE = false;

// Height below which there are no missing blocks in the index
const setIndexVerifiedHeight = (height) => blockchainStore.set('indexVerifiedHeight', height);
const getIndexVerifiedHeight = () => blockchainStore.get('indexVerifiedHeight');

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

const updateBlockRewards = async (job) => {
	const { generatorProps, revert } = job.data;
	const accountsDB = await getAccountsIndex();

	try {
		// Update producedBlocks & rewards
		const pkInfoArray = generatorProps;
		if (!pkInfoArray.isBlockIndexed) {
			const params = {
				where: {
					property: 'address',
					value: getBase32AddressFromPublicKey(pkInfoArray.publicKey),
				},
			};
			const amount = { rewards: BigInt(pkInfoArray.reward), producedBlocks: 1 };

			if (revert === true) params.decrement = amount;
			else params.increment = amount;

			// If no rows are affected with increment, insert the row
			const numRowsAffected = await accountsDB.increment(params);
			if (numRowsAffected === 0) {
				await accountsDB.upsert({
					address: getBase32AddressFromPublicKey(pkInfoArray.publicKey),
					publicKey: pkInfoArray.publicKey,
					producedBlocks: 1,
					rewards: pkInfoArray.reward,
				});
			}
		}
	} catch (error) {
		logger.debug('Error during vote aggregates update)');

		throw error;
	}
};

const updateVoteAggregates = async (job) => {
	const { voteToAggregate, revert } = job.data;

	const votesAggregateDB = await getVotesAggregateIndex();

	try {
		// Update the aggregated votes information
		const params = {
			where: {
				property: 'id',
				value: voteToAggregate.id,
			},
		};

		const amount = { amount: BigInt(voteToAggregate.amount) };

		if (revert === true) params.decrement = amount;
		else params.increment = amount;

		const numRowsAffected = await votesAggregateDB.increment(params);
		if (numRowsAffected === 0) {
			await votesAggregateDB.upsert(voteToAggregate.voteObject);
		}
	} catch (error) {
		logger.error('Error during vote aggregate updates');
		throw error;
	}
};

const voteAggregatesQueue = Queue(config.endpoints.redis, 'votingQueue', updateVoteAggregates, 1);
const blockRewardsQueue = Queue(config.endpoints.redis, 'blockRewardsQueue', updateBlockRewards, 1);

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

		if (KEY_BASED_ACCOUNT_UPDATE === true) {
			const addresses = ensureArray(accountsFromTransactions)
				.filter(a => a.publicKey).map(a => a.publicKey);
			const publicKeys = ensureArray(accountsFromTransactions)
				.filter(a => !a.publicKey).map(a => a.address);

			blocks.forEach(block => indexAccountByPublicKey(block.generatorPublicKey));
			publicKeys.forEach(pk => indexAccountByPublicKey(pk));
			addresses.forEach(a => indexAccountByAddress(a));
		}

		ensureArray(generatorPkInfoArray)
			.forEach(generatorProps => blockRewardsQueue.add({ generatorProps }));

		const { votes, votesToAggregateArray } = await getVoteIndexingInfo(blocks);
		if (votes.length) await votesDB.upsert(votes, trx);
		ensureArray(votesToAggregateArray)
			.forEach(voteToAggregate => voteAggregatesQueue.add({ voteToAggregate }));

		if (blocks.length) await blocksDB.upsert(blocks, trx);

		await commitDbTransaction(trx);
	} catch (error) {
		await rollbackDbTransaction(trx);

		// Revert rewards
		const generatorPkInfoArray = await getGeneratorPkInfoArray(blocks);
		ensureArray(generatorPkInfoArray)
			.forEach(generatorProps => blockRewardsQueue.add({ generatorProps, revert: true }));

		// Revert votes
		const { votesToAggregateArray } = await getVoteIndexingInfo(blocks);
		ensureArray(votesToAggregateArray)
			.forEach(voteToAggregate => voteAggregatesQueue.add({ voteToAggregate, revert: true }));

		logger.debug(`Rolled back MySQL transaction to index block at height ${height}`);

		if (error.message.includes('ER_LOCK_DEADLOCK')) {
			throw new Error(`Deadlock encountered while indexing blocks in height range ${height}. Will retry later.`);
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
const indexBlocksQueue = Queue(config.endpoints.redis, 'indexBlocksQueue', indexBlock, 30);
const updateBlockIndexQueue = Queue(config.endpoints.redis, 'updateBlockIndexQueue', updateBlockIndex, 1);
const deleteIndexedBlocksQueue = Queue(config.endpoints.redis, 'deleteIndexedBlocksQueue', deleteIndexedBlocks, 1);

const indexNewBlock = async height => {
	const blocksDB = await getBlocksIndex();
	const block = await getBlockByHeight(height);
	logger.info(`Indexing new block: ${block.id} at height ${block.height}`);

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

const getNonFinalHeights = async () => {
	const blocksDB = await getBlocksIndex();

	const [{ height: lastIndexedHeight } = {}] = await blocksDB.find({
		sort: 'height:asc',
		limit: 5000, // TODO: Check later for improvements
		isFinal: false,
	}, ['height']);

	return lastIndexedHeight || [];
};

const updateNonFinalBlocks = async () => {
	const cHeight = await getCurrentHeight();
	const nfHeights = await getNonFinalHeights();

	if (nfHeights.length > 0) {
		logger.info(`Re-indexing ${nfHeights.length} non-finalized blocks in the search index database`);
		await buildIndex(nfHeights[0].height, cHeight);
	}
};

const getMissingBlocksListByRange = async (params) => {
	const missingBlockRanges = await findMissingBlocksInRange(params.from, params.to);

	const convertRangesToArr = missingBlockRanges
		.map(range => Array(range.to - range.from + 1)
			.fill()
			.map((_, acc) => range.from + acc));

	const listOfMissingBlocks = convertRangesToArr
		.reduce((acc, curr) => acc
			.push(...curr) && acc, []);

	return listOfMissingBlocks;
};

module.exports = {
	indexBlock,
	indexNewBlock,
	indexMissingBlocks,
	updateNonFinalBlocks,
	getMissingBlocksListByRange,
};
