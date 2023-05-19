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
		getDBConnection,
		startDBTransaction,
		commitDBTransaction,
		rollbackDBTransaction,
	},
	Signals,
	MySQLKVStore: {
		getKeyValueTable,
	},
} = require('lisk-service-framework');

const { applyTransaction, revertTransaction } = require('./transactionProcessor');

const {
	getBlockByHeight,
	getTransactionIDsByBlockID,
	getTransactions,
	getEventsByHeight,
	deleteEventsFromCache,
} = require('../dataService');

const {
	range,
} = require('../utils/array');

const { getLisk32AddressFromPublicKey, updateAccountPublicKey } = require('../utils/account');
const { normalizeTransaction, getTransactionExecutionStatus } = require('../utils/transactions');
const { getEventsInfoToIndex } = require('../utils/events');
const { calcCommissionAmount, calcSelfStakeReward } = require('../utils/validator');

const {
	getFinalizedHeight,
	getGenesisHeight,
	EVENT,
	MODULE,
} = require('../constants');

const config = require('../../config');

const blocksTableSchema = require('../database/schema/blocks');
const eventsTableSchema = require('../database/schema/events');
const eventTopicsTableSchema = require('../database/schema/eventTopics');
const transactionsTableSchema = require('../database/schema/transactions');
const validatorsTableSchema = require('../database/schema/validators');

const MYSQL_ENDPOINT = config.endpoints.mysql;
const getKeyValueTableInstance = () => getKeyValueTable(config.kvStoreTableName, MYSQL_ENDPOINT);

const logger = Logger();

const getBlocksTable = () => getTableInstance(
	blocksTableSchema,
	MYSQL_ENDPOINT,
);

const getEventsTable = () => getTableInstance(
	eventsTableSchema,
	MYSQL_ENDPOINT,
);

const getEventTopicsTable = () => getTableInstance(
	eventTopicsTableSchema,
	MYSQL_ENDPOINT,
);

const getTransactionsTable = () => getTableInstance(
	transactionsTableSchema,
	MYSQL_ENDPOINT,
);

const getValidatorsTable = () => getTableInstance(
	validatorsTableSchema,
	MYSQL_ENDPOINT,
);

const { indexGenesisBlockAssets } = require('./genesisBlock');
const { updateTotalLockedAmounts } = require('../utils/blockchainIndex');
const { scheduleAccountBalanceUpdateFromEvents } = require('./accountBalanceIndex');

const INDEX_VERIFIED_HEIGHT = 'indexVerifiedHeight';

const validateBlock = (block) => !!block && block.height >= 0;

const indexBlock = async job => {
	const { block } = job.data;
	if (!validateBlock(block)) throw new Error(`Invalid block ${block.id} at height ${block.height}.`);

	const blocksTable = await getBlocksTable();
	const connection = await getDBConnection(MYSQL_ENDPOINT);
	const dbTrx = await startDBTransaction(connection);
	logger.debug(`Created new MySQL transaction to index block ${block.id} at height ${block.height}.`);

	let blockReward = BigInt('0');

	try {
		if (block.height === await getGenesisHeight()) {
			await indexGenesisBlockAssets(dbTrx);
		}

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

					// Store address -> publicKey mapping
					updateAccountPublicKey(tx.senderPublicKey);

					await transactionsTable.upsert(tx, dbTrx);

					// Invoke 'applyTransaction' to execute command specific processing logic
					await applyTransaction(blockHeader, tx, events, dbTrx);
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
			const blockRewardEvent = events.find(
				e => [MODULE.REWARD, MODULE.DYNAMIC_REWARD].includes(e.module)
					&& e.name === EVENT.REWARD_MINTED,
			);
			if (blockRewardEvent) {
				blockReward = BigInt(blockRewardEvent.data.amount || '0');

				if (blockReward !== BigInt('0')) {
					const commissionAmount = await calcCommissionAmount(
						block.generatorAddress, block.height, blockReward,
					);
					const selfStakeReward = await calcSelfStakeReward(
						block.generatorAddress, blockReward, commissionAmount,
					);

					await validatorsTable.increment({
						increment: { totalCommission: BigInt(commissionAmount) },
						where: { address: block.generatorAddress },
					}, dbTrx);
					await validatorsTable.increment({
						increment: { totalSelfStakeRewards: BigInt(selfStakeReward) },
						where: { address: block.generatorAddress },
					}, dbTrx);
				}
			}

			// Calculate locked amount change and update in key_value_store table for affected tokens
			const tokenIDLockedAmountChangeMap = {};
			events.forEach(event => {
				const { data: eventData } = event;
				// Initialize map entry with BigInt
				if ([EVENT.LOCK, EVENT.UNLOCK].includes(event.name)
					&& !(eventData.tokenID in tokenIDLockedAmountChangeMap)) {
					tokenIDLockedAmountChangeMap[eventData.tokenID] = BigInt(0);
				}

				if (event.name === EVENT.LOCK) {
					tokenIDLockedAmountChangeMap[eventData.tokenID] += BigInt(eventData.amount);
				} else if (event.name === EVENT.UNLOCK) {
					tokenIDLockedAmountChangeMap[eventData.tokenID] -= BigInt(eventData.amount);
				}
			});
			await updateTotalLockedAmounts(tokenIDLockedAmountChangeMap, dbTrx);

			// Schedule address balance updates from token module events
			await scheduleAccountBalanceUpdateFromEvents(events);
		}

		const blockToIndex = {
			...block,
			assetsModules: block.assets.map(asset => asset.module),
			numberOfEvents: events.length,
			reward: blockReward,
		};

		await blocksTable.upsert(blockToIndex, dbTrx);
		await commitDBTransaction(dbTrx);
		logger.debug(`Committed MySQL transaction to index block ${block.id} at height ${block.height}.`);
	} catch (error) {
		await rollbackDBTransaction(dbTrx);
		logger.debug(`Rolled back MySQL transaction to index block ${block.id} at height ${block.height}.`);

		if (['Deadlock found when trying to get lock', 'ER_LOCK_DEADLOCK'].some(e => error.message.includes(e))) {
			const errMessage = `Deadlock encountered while indexing block ${block.id} at height ${block.height}. Will retry later.`;
			logger.warn(errMessage);
			throw new Error(errMessage);
		}

		logger.warn(`Error occurred while indexing block ${block.id} at height ${block.height}. Will retry later.`);
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
	const connection = await getDBConnection(MYSQL_ENDPOINT);
	const dbTrx = await startDBTransaction(connection);
	logger.trace(`Created new MySQL transaction to delete block(s) with ID(s): ${blockIDs}.`);
	try {
		await BluebirdPromise.map(
			blocks,
			async block => {
				let forkedTransactions;
				const transactionsTable = await getTransactionsTable();
				const events = await getEventsByHeight(block.height);

				if (block.transactions && block.transactions.length) {
					const { transactions, assets, ...blockHeader } = block;

					forkedTransactions = await BluebirdPromise.map(
						transactions,
						async (tx) => {
							// Invoke 'revertTransaction' to execute command specific reverting logic
							await revertTransaction(blockHeader, tx, events, dbTrx);
							const normalizedTransaction = await normalizeTransaction(tx);
							return normalizedTransaction;
						},
						{ concurrency: block.transactions.length },
					);
				}

				const forkedTransactionIDs = await getTransactionIDsByBlockID(block.id);
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

				// Calculate locked amount change from events and update in key_value_store table
				if (events.length) {
					const tokenIDLockedAmountChangeMap = {};
					events.forEach(event => {
						const { data: eventData } = event;
						// Initialize map entry with BigInt
						if ([EVENT.LOCK, EVENT.UNLOCK].includes(event.name)
							&& !(eventData.tokenID in tokenIDLockedAmountChangeMap)) {
							tokenIDLockedAmountChangeMap[eventData.tokenID] = BigInt(0);
						}

						// Negate amount to reverse the effect
						if (event.name === EVENT.LOCK) {
							tokenIDLockedAmountChangeMap[eventData.tokenID] -= BigInt(eventData.amount);
						} else if (event.name === EVENT.UNLOCK) {
							tokenIDLockedAmountChangeMap[eventData.tokenID] += BigInt(eventData.amount);
						}
					});
					await updateTotalLockedAmounts(tokenIDLockedAmountChangeMap, dbTrx);

					// Schedule address balance updates from token module events
					await scheduleAccountBalanceUpdateFromEvents(events);
				}

				// Invalidate cached events of this block
				// This must be done after processing all event related calculations
				await deleteEventsFromCache(block.height);
			});

		await blocksTable.deleteByPrimaryKey(blockIDs);
		await commitDBTransaction(dbTrx);
		logger.debug(`Committed MySQL transaction to delete block(s) with ID(s): ${blockIDs}.`);
	} catch (error) {
		logger.debug(`Rolled back MySQL transaction to delete block(s) with ID(s): ${blockIDs}.`);
		await rollbackDBTransaction(dbTrx);

		if (error.message.includes('ER_LOCK_DEADLOCK')) {
			const errMessage = `Deadlock encountered while deleting block(s) with ID(s): ${blockIDs}. Will retry later.`;
			logger.warn(errMessage);
			throw new Error(errMessage);
		}

		logger.warn(`Error occurred while deleting block(s) with ID(s): ${blockIDs}. Will retry later.`);
		throw error;
	}
};

// Initialize queues
const indexBlocksQueue = Queue(
	config.endpoints.cache,
	config.queue.indexBlocks.name,
	indexBlock,
	config.queue.indexBlocks.concurrency,
);
const updateBlockIndexQueue = Queue(
	config.endpoints.cache,
	config.queue.updateBlockIndex.name,
	updateBlockIndex,
	config.queue.updateBlockIndex.concurrency,
);
const deleteIndexedBlocksQueue = Queue(
	config.endpoints.cache,
	config.queue.deleteIndexedBlocks.name,
	deleteIndexedBlocks,
	config.queue.deleteIndexedBlocks.concurrency,
);

const getLiveIndexingJobCount = async () => {
	const { queue: bullQueue } = indexBlocksQueue;
	const count = await bullQueue.getActiveCount() || await bullQueue.getWaitingCount();
	return count;
};

const deleteBlock = async (block) => deleteIndexedBlocksQueue.add({ blocks: [block] });

const indexNewBlock = async block => {
	const blocksTable = await getBlocksTable();
	logger.info(`Indexing new block: ${block.id} at height ${block.height}.`);

	const [blockInfo] = await blocksTable.find({ height: block.height, limit: 1 }, ['id', 'isFinal']);
	// Schedule indexing of incoming block if it is not indexed before
	// Or the indexed block is not final yet (chain fork)
	if (!blockInfo || !blockInfo.isFinal) {
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

const findMissingBlocksInRange = async (fromHeight, toHeight) => {
	let result = [];

	const totalNumOfBlocks = toHeight - fromHeight + 1;
	logger.info(`Checking for missing blocks between height ${fromHeight}-${toHeight} (${totalNumOfBlocks} blocks).`);

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
	logContent.forEach(o => logger.info(`Missing blocks in range: ${o}.`));

	return result;
};

const getMissingBlocks = async (params) => {
	const missingBlockRanges = await findMissingBlocksInRange(params.from, params.to);
	const nestedListOfRanges = missingBlockRanges
		.map(entry => range(entry.from, entry.to + 1)); // 'to + 1' as 'to' is non-inclusive
	const listOfMissingBlocks = nestedListOfRanges.flat();
	return listOfMissingBlocks;
};

const addBlockToQueue = async height => {
	const block = await getBlockByHeight(height);
	indexBlocksQueue.add({ block });
};

const setIndexVerifiedHeight = async ({ height }) => {
	const keyValueTable = await getKeyValueTableInstance();
	return keyValueTable.set(INDEX_VERIFIED_HEIGHT, height);
};

const getIndexVerifiedHeight = async () => {
	const keyValueTable = await getKeyValueTableInstance();
	return keyValueTable.get(INDEX_VERIFIED_HEIGHT);
};

module.exports = {
	indexNewBlock,
	addBlockToQueue,
	getMissingBlocks,
	deleteBlock,
	setIndexVerifiedHeight,
	getIndexVerifiedHeight,
	getLiveIndexingJobCount,
};
