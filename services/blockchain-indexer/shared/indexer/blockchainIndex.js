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
	Queue,
	MySQL: {
		getTableInstance,
		getDbConnection,
		startDbTransaction,
		commitDbTransaction,
		rollbackDbTransaction,
	},
	Signals,
} = require('lisk-service-framework');

const { applyTransaction, revertTransaction } = require('./transactionProcessor');

const {
	getBlockByHeight,
	getTransactionIDsByBlockID,
	getTransactions,
	getEventsByHeight,
} = require('../dataService');

const {
	range,
} = require('../utils/arrayUtils');

const { getLisk32AddressFromPublicKey, updateAccountPublicKey } = require('../utils/accountUtils');
const { normalizeTransaction } = require('../utils/transactionsUtils');
const { getEventsInfoToIndex } = require('../utils/eventsUtils');
const { calculateCommission, calculateSelfStakeRewards } = require('../utils/validatorUtils');

const { updateAddressBalanceQueue } = require('./tokenIndex');

const {
	getFinalizedHeight,
	getCurrentHeight,
	getGenesisHeight,
} = require('../constants');

const config = require('../../config');

const keyValueTable = require('../database/mysqlKVStore');

const blocksTableSchema = require('../database/schema/blocks');
const eventsTableSchema = require('../database/schema/events');
const eventTopicsTableSchema = require('../database/schema/eventTopics');
const transactionsTableSchema = require('../database/schema/transactions');
const validatorsTableSchema = require('../database/schema/validators');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const logger = Logger();

const getBlocksTable = () => getTableInstance(
	blocksTableSchema.tableName,
	blocksTableSchema,
	MYSQL_ENDPOINT,
);

const getEventsTable = () => getTableInstance(
	eventsTableSchema.tableName,
	eventsTableSchema,
	MYSQL_ENDPOINT,
);

const getEventTopicsTable = () => getTableInstance(
	eventTopicsTableSchema.tableName,
	eventTopicsTableSchema,
	MYSQL_ENDPOINT,
);

const getTransactionsTable = () => getTableInstance(
	transactionsTableSchema.tableName,
	transactionsTableSchema,
	MYSQL_ENDPOINT,
);

const getValidatorsTable = () => getTableInstance(
	validatorsTableSchema.tableName,
	validatorsTableSchema,
	MYSQL_ENDPOINT,
);

const INDEX_VERIFIED_HEIGHT = 'indexVerifiedHeight';

const validateBlock = (block) => !!block && block.height >= 0;

const getTransactionExecutionStatus = (tx, events) => {
	const expectedEventName = `${tx.module}:commandExecutionResult`;
	const commandExecResultEvents = events.filter(e => `${e.module}:${e.name}` === expectedEventName);
	const txExecResultEvent = commandExecResultEvents.find(e => e.topics.includes(tx.id));
	if (!txExecResultEvent) throw Error(`Event unavailable to determine execution status for transaction: ${tx.id}.`);
	return txExecResultEvent.data.data === '0801' ? 'success' : 'fail';
};

const indexBlock = async job => {
	const { block } = job.data;
	if (!validateBlock(block)) throw new Error(`Invalid block ${block.id} at height ${block.height} }.`);

	const blocksTable = await getBlocksTable();
	const connection = await getDbConnection();
	const dbTrx = await startDbTransaction(connection);
	logger.debug(`Created new MySQL transaction to index block ${block.id} at height ${block.height}.`);

	let blockReward = BigInt('0');

	try {
		const events = await getEventsByHeight(block.height);

		if (block.transactions.length) {
			const { transactions, assets, ...blockHeader } = block;

			const transactionsTable = await getTransactionsTable();
			await BluebirdPromise.map(
				block.transactions,
				async (tx, index) => {
					// Apply default transformations and index with minimal information by default
					tx.index = index;
					tx.moduleCommand = `${tx.module}:${tx.command}`;
					tx.blockID = block.id;
					tx.height = block.height;
					tx.senderAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);
					tx.timestamp = block.timestamp;
					tx.executionStatus = getTransactionExecutionStatus(tx, events);
					await updateAddressBalanceQueue.add({ address: tx.senderAddress });

					// Store address -> publicKey mapping
					updateAccountPublicKey(tx.senderPublicKey);

					await transactionsTable.upsert(tx, dbTrx);

					// Invoke 'applyTransaction' to execute command specific processing logic
					await applyTransaction(blockHeader, tx, dbTrx);
				},
				{ concurrency: block.transactions.length },
			);
		}

		// Update generatedBlocks count for the block generator
		const validatorsTable = await getValidatorsTable();
		const numRowsAffected = await validatorsTable.increment({
			increment: { generatedBlocks: 1 },
			where: { address: block.generatorAddress },
		}, dbTrx);
		if (numRowsAffected === 0) {
			await validatorsTable.upsert({
				address: block.generatorAddress,
				generatedBlocks: 1,
			}, dbTrx);
		}

		if (events.length) {
			const eventsTable = await getEventsTable();
			const eventTopicsTable = await getEventTopicsTable();

			const { eventsInfo, eventTopicsInfo } = await getEventsInfoToIndex(block, events);
			await eventsTable.upsert(eventsInfo, dbTrx);
			await eventTopicsTable.upsert(eventTopicsInfo, dbTrx);

			// Update the generator's rewards
			// TODO: Create constants
			const blockRewardEvent = events.find(e => ['reward', 'dynamicReward'].includes(e.module) && e.name === 'rewardMinted');
			if (blockRewardEvent) {
				blockReward = BigInt(blockRewardEvent.data.amount || '0');

				if (blockReward !== BigInt('0')) {
					// TODO: Implement proper logic
					const commission = await calculateCommission(block.generatorAddress, blockReward);
					const selfStakeReward = await calculateSelfStakeRewards(block.generatorAddress);

					await validatorsTable.increment({
						increment: { totalCommission: BigInt(commission) },
						where: { address: block.generatorAddress },
					}, dbTrx);
					await validatorsTable.increment({
						increment: { totalSelfStakeRewards: BigInt(selfStakeReward) },
						where: { address: block.generatorAddress },
					}, dbTrx);
				}
			}
		}

		if (block.generatorAddress) {
			await updateAddressBalanceQueue.add({ address: block.generatorAddress });
		}

		const blockToIndex = {
			...block,
			assetsModules: block.assets.map(asset => asset.module),
			numberOfEvents: events.length,
			reward: blockReward,
		};

		await blocksTable.upsert(blockToIndex, dbTrx);
		await commitDbTransaction(dbTrx);
		logger.debug(`Committed MySQL transaction to index block ${block.id} at height ${block.height}`);
	} catch (error) {
		await rollbackDbTransaction(dbTrx);
		logger.debug(`Rolled back MySQL transaction to index block ${block.id} at height ${block.height}`);

		if (error.message.includes('ER_LOCK_DEADLOCK')) {
			const errMessage = `Deadlock encountered while indexing block ${block.id} at height ${block.height}. Will retry later.`;
			logger.warn(errMessage);
			throw new Error(errMessage);
		}

		logger.warn(`Error occured while indexing block ${block.id} at height ${block.height}. Will retry later.`);
		logger.warn(error.stack);
		throw error;
	}
};

const updateBlockIndex = async job => {
	const blocksTable = await getBlocksTable();
	const { blocks } = job.data;
	await blocksTable.upsert(blocks);
};

const deleteIndexedBlocks = async job => {
	const { blocks } = job.data;
	const blockIDs = blocks.map(b => b.id).join(', ');

	const blocksTable = await getBlocksTable();
	const connection = await getDbConnection();
	const dbTrx = await startDbTransaction(connection);
	logger.trace(`Created new MySQL transaction to delete block(s) with ID(s): ${blockIDs}`);
	try {
		await BluebirdPromise.map(
			blocks,
			async block => {
				let forkedTransactions;
				const transactionsTable = await getTransactionsTable();

				if (block.transactions && block.transactions.length) {
					const { transactions, assets, ...blockHeader } = block;

					forkedTransactions = await BluebirdPromise.map(
						transactions,
						async (tx) => {
							// Invoke 'revertTransaction' to execute command specific reverting logic
							await revertTransaction(blockHeader, tx, dbTrx);
							const normalizedTransaction = await normalizeTransaction(tx);
							return normalizedTransaction;
						},
						{ concurrency: block.transactions.length },
					);
				}

				const forkedTransactionIDs = await getTransactionIDsByBlockID(block.header.id);
				if (!Array.isArray(forkedTransactions)) {
					const deletedTransactions = await BluebirdPromise.map(
						forkedTransactionIDs,
						async txID => {
							const transaction = await getTransactions({ id: txID });
							return transaction.data ? transaction.data[0] : null;
						},
						{ concurrency: 25 },
					);
					forkedTransactions = deletedTransactions.map(e => e !== null);
				}
				await transactionsTable.deleteByPrimaryKey(forkedTransactionIDs, dbTrx);
				Signals.get('deleteTransactions').dispatch({ data: forkedTransactions });
			});

		await blocksTable.deleteByPrimaryKey(blockIDs);
		await commitDbTransaction(dbTrx);
		logger.debug(`Committed MySQL transaction to delete block(s) with ID(s): ${blockIDs}`);
	} catch (error) {
		logger.debug(`Rolled back MySQL transaction to delete block(s) with ID(s): ${blockIDs}`);
		await rollbackDbTransaction(dbTrx);

		if (error.message.includes('ER_LOCK_DEADLOCK')) {
			const errMessage = `Deadlock encountered while deleting block(s) with ID(s): ${blockIDs}. Will retry later.`;
			logger.warn(errMessage);
			throw new Error(errMessage);
		}

		logger.warn(`Error occured while deleting block(s) with ID(s): ${blockIDs}. Will retry later.`);
		throw error;
	}
};

// Initialize queues
const indexBlocksQueue = Queue(config.endpoints.cache, 'indexBlocksQueue', indexBlock, 1);
const updateBlockIndexQueue = Queue(config.endpoints.cache, 'updateBlockIndexQueue', updateBlockIndex, 1);
const deleteIndexedBlocksQueue = Queue(config.endpoints.cache, 'deleteIndexedBlocksQueue', deleteIndexedBlocks, 1);

const deleteBlock = async (block) => deleteIndexedBlocksQueue.add({ blocks: [block] });

const indexNewBlock = async block => {
	const blocksTable = await getBlocksTable();
	logger.info(`Indexing new block: ${block.id} at height ${block.height}`);

	const [blockInfo] = await blocksTable.find({ height: block.height, limit: 1 }, ['id', 'isFinal']);
	if (!blockInfo || (!blockInfo.isFinal && block.isFinal)) {
		// Index if doesn't exist, or update if it isn't set to final
		await indexBlocksQueue.add({ block });

		// Update block finality status
		const finalizedBlockHeight = await getFinalizedHeight();
		const nonFinalBlocks = await blocksTable.find({ isFinal: false, limit: 1000 },
			Object.keys(blocksTableSchema.schema));
		await updateBlockIndexQueue.add({
			blocks: nonFinalBlocks
				.filter(b => b.height <= finalizedBlockHeight)
				.map(b => ({ ...b, isFinal: true })),
		});

		if (blockInfo && blockInfo.id !== block.id) {
			// Fork detected

			const [highestIndexedBlock] = await blocksTable.find({ sort: 'height:desc', limit: 1 }, ['height']);
			const blocksToRemove = await blocksTable.find({
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

	const blocksTable = await getBlocksTable();
	const propBetweens = [{
		property: 'height',
		from: fromHeight,
		to: toHeight,
	}];
	const indexedBlockCount = await blocksTable.count({ propBetweens });

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

		const missingBlockRanges = await blocksTable.rawQuery(missingBlocksQueryStatement);

		result = missingBlockRanges;
	}

	const logContent = result.map(o => `${o.from}-${o.to} (${o.to - o.from + 1} blocks)`);
	logContent.forEach(o => logger.info(`Missing blocks in range: ${o}`));

	return result;
};

const getMinNonFinalHeight = async () => {
	const blocksTable = await getBlocksTable();

	const [{ height: lastIndexedHeight } = {}] = await blocksTable.find({
		sort: 'height:asc',
		limit: 1,
		isFinal: false,
	}, ['height']);

	return lastIndexedHeight;
};

const updateNonFinalBlocks = async () => {
	const cHeight = await getCurrentHeight();
	const minNFHeight = await getMinNonFinalHeight();

	if (typeof minNFHeight === 'number') {
		logger.info(`Re-indexing ${cHeight - minNFHeight + 1} non-finalized blocks`);
		await buildIndex(minNFHeight, cHeight);
	}
};

const getMissingBlocks = async (params) => {
	const missingBlockRanges = await findMissingBlocksInRange(params.from, params.to);
	const nestedListOfRanges = missingBlockRanges
		.map(entry => range(entry.from, entry.to + 1)); // 'to + 1' as 'to' is non-inclusive
	const listOfMissingBlocks = nestedListOfRanges.flat();
	return listOfMissingBlocks;
};

const isGenesisBlockIndexed = async () => {
	const blocksTable = await getBlocksTable();
	const genesisHeight = await getGenesisHeight();
	const [block] = await blocksTable.find({ height: genesisHeight, limit: 1 }, ['height']);
	return !!block;
};

const addBlockToQueue = async height => {
	const block = await getBlockByHeight(height);
	indexBlocksQueue.add({ block });
};

const setIndexVerifiedHeight = ({ height }) => keyValueTable.set(INDEX_VERIFIED_HEIGHT, height);

const getIndexVerifiedHeight = () => keyValueTable.get(INDEX_VERIFIED_HEIGHT);

module.exports = {
	indexBlock,
	indexNewBlock,
	updateNonFinalBlocks,
	isGenesisBlockIndexed,
	addBlockToQueue,
	getMissingBlocks,
	deleteBlock,
	setIndexVerifiedHeight,
	getIndexVerifiedHeight,
};
