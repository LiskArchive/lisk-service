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
	Signals,
	DB: {
		MySQL: {
			getTableInstance,
			getDBConnection,
			startDBTransaction,
			commitDBTransaction,
			rollbackDBTransaction,
			KVStore: { getKeyValueTable },
		},
	},
	Utils: {
		delay,
	},
} = require('lisk-service-framework');

const { applyTransaction, revertTransaction } = require('./transactionProcessor');

const {
	getBlockByHeight,
	getTransactionIDsByBlockID,
	getTransactions,
	getEventsByHeight,
	cacheEventsByBlockID,
	getEventsByBlockID,
	deleteEventsFromCacheByBlockID,
	getTransactionsByBlockID,
} = require('../dataService');

const { range } = require('../utils/array');
const { getLisk32AddressFromPublicKey } = require('../utils/account');
const { getTransactionExecutionStatus } = require('../utils/transactions');
const { getEventsInfoToIndex } = require('./utils/events');
const { calcCommissionAmount, calcSelfStakeReward } = require('./utils/validator');
const { indexAccountPublicKey } = require('./accountIndex');
const { indexGenesisBlockAssets } = require('./genesisBlock');
const { updateTotalLockedAmounts } = require('./utils/blockchainIndex');
const {
	getAddressesFromTokenEvents,
	scheduleAddressesBalanceUpdate,
} = require('./accountBalanceIndex');

const {
	getFinalizedHeight,
	getGenesisHeight,
	EVENT,
	MODULE,
	getCurrentHeight,
} = require('../constants');

const config = require('../../config');

const blocksTableSchema = require('../database/schema/blocks');
const eventsTableSchema = require('../database/schema/events');
const eventTopicsTableSchema = require('../database/schema/eventTopics');
const transactionsTableSchema = require('../database/schema/transactions');
const validatorsTableSchema = require('../database/schema/validators');

const MYSQL_ENDPOINT = config.endpoints.mysql;
const keyValueTable = getKeyValueTable();

const logger = Logger();

const getBlocksTable = () => getTableInstance(blocksTableSchema, MYSQL_ENDPOINT);
const getEventsTable = () => getTableInstance(eventsTableSchema, MYSQL_ENDPOINT);
const getEventTopicsTable = () => getTableInstance(eventTopicsTableSchema, MYSQL_ENDPOINT);
const getTransactionsTable = () => getTableInstance(transactionsTableSchema, MYSQL_ENDPOINT);
const getValidatorsTable = () => getTableInstance(validatorsTableSchema, MYSQL_ENDPOINT);

const INDEX_VERIFIED_HEIGHT = 'indexVerifiedHeight';

const validateBlock = block => !!block && block.height >= 0;

const indexBlock = async job => {
	const { height: blockHeightFromJobData } = job.data;
	let blockHeightToIndex = blockHeightFromJobData;
	let addressesToUpdateBalance = [];

	const blocksTable = await getBlocksTable();

	const [lastIndexedBlock = {}] = await blocksTable.find(
		{
			sort: 'height:desc',
			limit: 1,
		},
		['height'],
	);

	const { height: lastIndexedHeight } = lastIndexedBlock;

	// Index last indexed block height + 1 and schedule the next block if there is a gap
	if (lastIndexedHeight && lastIndexedHeight < blockHeightFromJobData - 1) {
		blockHeightToIndex = lastIndexedHeight + 1;
		// eslint-disable-next-line no-use-before-define
		await addHeightToIndexBlocksQueue(blockHeightToIndex + 1);
	}

	const [currentBlockInDB = {}] = await blocksTable.find(
		{
			where: { height: blockHeightToIndex },
			limit: 1,
		},
		['height'],
	);

	// If current block is already indexed, then index the highest indexed block height + 1
	if (Object.keys(currentBlockInDB).length) {
		// Skip indexing if the blockchain is fully indexed.
		const currentBlockchainHeight = await getCurrentHeight();
		if (lastIndexedHeight >= currentBlockchainHeight) return;

		blockHeightToIndex = lastIndexedHeight + 1;
	}

	const block = await getBlockByHeight(blockHeightToIndex);
	if (!validateBlock(block)) {
		throw new Error(`Invalid block ${block.id} at height ${block.height}.`);
	}

	// Create DB transaction. Queries from here sees a snapshot of the database
	const connection = await getDBConnection(MYSQL_ENDPOINT);
	const dbTrx = await startDBTransaction(connection);
	logger.debug(
		`Created new MySQL transaction to index block ${block.id} at height ${block.height}.`,
	);

	let blockReward = BigInt('0');

	try {
		if (block.height === (await getGenesisHeight())) {
			await indexGenesisBlockAssets(dbTrx);
		}

		const events = await getEventsByHeight(block.height);
		cacheEventsByBlockID(block.id, events);

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
					indexAccountPublicKey(tx.senderPublicKey);

					await transactionsTable.upsert(tx, dbTrx);

					// Invoke 'applyTransaction' to execute command specific processing logic
					await applyTransaction(blockHeader, tx, events, dbTrx);
				},
				{ concurrency: block.transactions.length },
			);
		}

		// Update generatedBlocks count for the block generator
		const validatorsTable = await getValidatorsTable();
		const numRowsAffected = await validatorsTable.increment(
			{
				increment: { generatedBlocks: 1 },
				where: { address: block.generatorAddress },
			},
			dbTrx,
		);
		if (numRowsAffected === 0) {
			await validatorsTable.upsert(
				{
					address: block.generatorAddress,
					generatedBlocks: 1,
				},
				dbTrx,
			);
		}

		if (events.length) {
			const eventsTable = await getEventsTable();
			const eventTopicsTable = await getEventTopicsTable();

			const { eventsInfo, eventTopicsInfo } = await getEventsInfoToIndex(block, events);
			await eventsTable.upsert(eventsInfo, dbTrx);
			await eventTopicsTable.upsert(eventTopicsInfo, dbTrx);

			// Update block generator's rewards
			const blockRewardEvent = events.find(
				e => [MODULE.REWARD, MODULE.DYNAMIC_REWARD].includes(e.module)
					&& e.name === EVENT.REWARD_MINTED,
			);
			if (blockRewardEvent) {
				blockReward = BigInt(blockRewardEvent.data.amount || '0');

				if (blockReward !== BigInt('0')) {
					const commissionAmount = await calcCommissionAmount(
						block.generatorAddress,
						block.height,
						blockReward,
					);
					const selfStakeReward = await calcSelfStakeReward(
						block.generatorAddress,
						blockReward,
						commissionAmount,
					);

					logger.trace(
						`Increasing commission for validator ${block.generatorAddress} by ${commissionAmount}.`,
					);
					await validatorsTable.increment(
						{
							increment: { totalCommission: BigInt(commissionAmount) },
							where: { address: block.generatorAddress },
						},
						dbTrx,
					);
					logger.debug(
						`Increased commission for validator ${block.generatorAddress} by ${commissionAmount}.`,
					);
					logger.trace(
						`Increasing self-stake rewards for validator ${block.generatorAddress} by ${selfStakeReward}.`,
					);
					await validatorsTable.increment(
						{
							increment: { totalSelfStakeRewards: BigInt(selfStakeReward) },
							where: { address: block.generatorAddress },
						},
						dbTrx,
					);
					logger.debug(
						`Increased self-stake rewards for validator ${block.generatorAddress} by ${selfStakeReward}.`,
					);
				}
			}

			// Calculate locked amount change and update in key_value_store table for affected tokens
			const tokenIDLockedAmountChangeMap = {};
			events.forEach(event => {
				const { data: eventData } = event;
				// Initialize map entry with BigInt
				if (
					[EVENT.LOCK, EVENT.UNLOCK].includes(event.name)
					&& !(eventData.tokenID in tokenIDLockedAmountChangeMap)
				) {
					tokenIDLockedAmountChangeMap[eventData.tokenID] = BigInt(0);
				}

				if (event.name === EVENT.LOCK) {
					tokenIDLockedAmountChangeMap[eventData.tokenID] += BigInt(eventData.amount);
				} else if (event.name === EVENT.UNLOCK) {
					tokenIDLockedAmountChangeMap[eventData.tokenID] -= BigInt(eventData.amount);
				}
			});
			await updateTotalLockedAmounts(tokenIDLockedAmountChangeMap, dbTrx);

			// Get addresses to schedule account balance updates from token module events
			addressesToUpdateBalance = getAddressesFromTokenEvents(events);
		}

		const blockToIndex = {
			...block,
			assetsModules: block.assets.map(asset => asset.module),
			numberOfEvents: events.length,
			reward: blockReward,
		};

		await blocksTable.upsert(blockToIndex, dbTrx);
		await commitDBTransaction(dbTrx);
		// Only schedule address balance updates if the block is indexed successfully
		await scheduleAddressesBalanceUpdate(addressesToUpdateBalance);
		logger.debug(
			`Committed MySQL transaction to index block ${block.id} at height ${block.height}.`,
		);
	} catch (error) {
		await rollbackDBTransaction(dbTrx);

		// Reschedule the block for indexing
		// eslint-disable-next-line no-use-before-define
		await addHeightToIndexBlocksQueue(blockHeightToIndex);

		logger.debug(
			`Rolled back MySQL transaction to index block ${block.id} at height ${block.height}.`,
		);

		if (
			['Deadlock found when trying to get lock', 'ER_LOCK_DEADLOCK'].some(e => error.message.includes(e),
			)
		) {
			const errMessage = `Deadlock encountered while indexing block ${block.id} at height ${block.height}. Will retry later. sql:${error.sql}`;
			logger.warn(errMessage);
			throw new Error(errMessage);
		}

		logger.warn(
			`Error occurred while indexing block ${block.id} at height ${block.height}. Will retry later.`,
		);
		logger.warn(error.stack);
		throw error;
	}
};

const deleteIndexedBlocks = async job => {
	let addressesToUpdateBalance = [];
	const { blocks } = job.data;
	const blockIDs = blocks.map(b => b.id).join(', ');

	const blocksTable = await getBlocksTable();
	const connection = await getDBConnection(MYSQL_ENDPOINT);
	const dbTrx = await startDBTransaction(connection);
	logger.trace(`Created new MySQL transaction to delete block(s) with ID(s): ${blockIDs}.`);

	let blockReward = BigInt('0');

	try {
		await BluebirdPromise.map(
			blocks,
			async block => {
				const blockFromNode = await getBlockByHeight(block.height);
				if (blockFromNode.id === block.id) return;

				// Check if deleted block is indexed
				const [deletedBlockFromDB] = await blocksTable.find({ height: block.height, limit: 1 });

				// Reschedule job if not deleted block is not indexed
				if (!deletedBlockFromDB) {
					// eslint-disable-next-line no-use-before-define
					await scheduleBlockDeletion(block);
					return;
				}
				// If deleted block is indexed, check for the blockID
				// Continue only when blockID matches else skip
				if (deletedBlockFromDB.id !== block.id) return;

				let { data: forkedTransactions } = await getTransactionsByBlockID(block.id);
				const transactionsTable = await getTransactionsTable();
				const events = await getEventsByBlockID(block.id);

				if (Array.isArray(forkedTransactions)) {
					const { assets, ...blockHeader } = block;

					await BluebirdPromise.map(
						forkedTransactions,
						async tx => {
							// Invoke 'revertTransaction' to execute command specific reverting logic
							await revertTransaction(blockHeader, tx, events, dbTrx);
						},
						{ concurrency: 1 },
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
					const eventsTable = await getEventsTable();
					const eventTopicsTable = await getEventTopicsTable();

					const { eventsInfo, eventTopicsInfo } = await getEventsInfoToIndex(block, events);
					await eventsTable.delete(eventsInfo, dbTrx);
					await eventTopicsTable.delete(eventTopicsInfo, dbTrx);

					// Update the generator's rewards
					const blockRewardEvent = events.find(
						e => [MODULE.REWARD, MODULE.DYNAMIC_REWARD].includes(e.module)
							&& e.name === EVENT.REWARD_MINTED,
					);
					if (blockRewardEvent) {
						blockReward = BigInt(blockRewardEvent.data.amount || '0');

						if (blockReward !== BigInt('0')) {
							const commissionAmount = await calcCommissionAmount(
								block.generatorAddress,
								block.height,
								blockReward,
							);
							const selfStakeReward = await calcSelfStakeReward(
								block.generatorAddress,
								blockReward,
								commissionAmount,
							);

							const validatorsTable = await getValidatorsTable();
							logger.trace(
								`Decreasing commission for validator ${block.generatorAddress} by ${commissionAmount}.`,
							);
							await validatorsTable.decrement(
								{
									decrement: { totalCommission: BigInt(commissionAmount) },
									where: { address: block.generatorAddress },
								},
								dbTrx,
							);
							logger.debug(
								`Decreased commission for validator ${block.generatorAddress} by ${commissionAmount}.`,
							);
							logger.trace(
								`Decreasing self-stake rewards for validator ${block.generatorAddress} by ${selfStakeReward}.`,
							);
							await validatorsTable.decrement(
								{
									decrement: { totalSelfStakeRewards: BigInt(selfStakeReward) },
									where: { address: block.generatorAddress },
								},
								dbTrx,
							);
							logger.debug(
								`Decreased self-stake rewards for validator ${block.generatorAddress} by ${selfStakeReward}.`,
							);
						}
					}

					// Calculate locked amount change and update in key_value_store table for affected tokens
					const tokenIDLockedAmountChangeMap = {};
					events.forEach(event => {
						const { data: eventData } = event;
						// Initialize map entry with BigInt
						if (
							[EVENT.LOCK, EVENT.UNLOCK].includes(event.name)
							&& !(eventData.tokenID in tokenIDLockedAmountChangeMap)
						) {
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

					// Get addresses to schedule account balance updates from token module events
					addressesToUpdateBalance = getAddressesFromTokenEvents(events);
				}

				// Invalidate cached events for this block
				// This must be done after processing all event related calculations
				await deleteEventsFromCacheByBlockID(block.id);
			},
			{ concurrency: 1 },
		);

		await blocksTable.deleteByPrimaryKey(blockIDs, dbTrx);
		await commitDBTransaction(dbTrx);
		// Only schedule address balance updates if the block is deleted successfully
		await scheduleAddressesBalanceUpdate(addressesToUpdateBalance);
		logger.debug(`Committed MySQL transaction to delete block(s) with ID(s): ${blockIDs}.`);
	} catch (error) {
		logger.debug(`Rolled back MySQL transaction to delete block(s) with ID(s): ${blockIDs}.`);
		await rollbackDBTransaction(dbTrx);

		if (error.message.includes('ER_LOCK_DEADLOCK')) {
			const errMessage = `Deadlock encountered while deleting block(s) with ID(s): ${blockIDs}. Will retry later.`;
			logger.warn(errMessage);
			throw new Error(errMessage);
		}

		logger.warn(
			`Error occurred while deleting block(s) with ID(s): ${blockIDs}. Will retry later.`,
		);
		throw error;
	}
};

let isIndexingRunning = false;
const BLOCKCHAIN_INDEX_RESCHEDULE_DELAY = 1000;

const indexBlockAtomicWrapper = async (job) => {
	if (isIndexingRunning) {
		// TODO: make this trace before merge
		logger.warn('Already indexing another block!');
		await delay(BLOCKCHAIN_INDEX_RESCHEDULE_DELAY);
		// eslint-disable-next-line no-use-before-define
		await addHeightToIndexBlocksQueue(job.data.height);
		return;
	}

	isIndexingRunning = true;

	try {
		await indexBlock(job);
	} catch (err) {
		isIndexingRunning = false;
		logger.error(`Error occurred during indexing block.\nError: ${err.message}`);
		throw new Error(err);
	}

	isIndexingRunning = false;
};

// Initialize queues
const indexBlocksQueue = Queue(
	config.endpoints.cache,
	config.queue.indexBlocks.name,
	indexBlockAtomicWrapper,
	config.queue.indexBlocks.concurrency,
);

const deleteIndexedBlocksQueue = Queue(
	config.endpoints.cache,
	config.queue.deleteIndexedBlocks.name,
	deleteIndexedBlocks,
	config.queue.deleteIndexedBlocks.concurrency,
);

const getLiveIndexingJobCount = async () => {
	const { queue: bullQueue } = indexBlocksQueue;
	const jobCount = await bullQueue.getJobCounts();
	const count = jobCount.active + jobCount.waiting;
	return count;
};

const scheduleBlockDeletion = async block => deleteIndexedBlocksQueue.add({ blocks: [block] });

const indexNewBlock = async block => {
	const blocksTable = await getBlocksTable();
	logger.info(`Indexing new block: ${block.id} at height ${block.height}.`);

	const [blockInfo] = await blocksTable.find({ height: block.height, limit: 1 }, ['id', 'isFinal']);
	// Schedule indexing of incoming block if it is not indexed before
	// Or the indexed block is not final yet (chain fork)
	if (!blockInfo || !blockInfo.isFinal) {
		// Index if doesn't exist, or update if it isn't set to final
		await indexBlocksQueue.add({ height: block.height });

		// Update finality status for the parent blocks
		const finalizedBlockHeight = await getFinalizedHeight();
		await blocksTable.update({
			where: {
				isFinal: false,
				propBetweens: [
					{
						property: 'height',
						to: finalizedBlockHeight,
					},
				],
			},
			updates: { isFinal: true },
		});

		if (blockInfo && blockInfo.id !== block.id) {
			// Fork detected
			const [highestIndexedBlock] = await blocksTable.find({ sort: 'height:desc', limit: 1 }, [
				'height',
			]);
			const blocksToRemove = await blocksTable.find(
				{
					propBetweens: [
						{
							property: 'height',
							from: block.height + 1,
							to: highestIndexedBlock.height,
						},
					],
					sort: 'height:desc',
					limit: highestIndexedBlock.height - block.height,
				},
				['id'],
			);
			await deleteIndexedBlocksQueue.add({ blocks: blocksToRemove });
		}
	}
};

const findMissingBlocksInRange = async (fromHeight, toHeight) => {
	const result = [];

	const totalNumOfBlocks = toHeight - fromHeight + 1;
	logger.info(
		`Checking for missing blocks between height ${fromHeight}-${toHeight} (${totalNumOfBlocks} blocks).`,
	);

	const blocksTable = await getBlocksTable();
	const propBetweens = [
		{
			property: 'height',
			from: fromHeight,
			to: toHeight,
		},
	];
	const indexedBlockCount = await blocksTable.count({ propBetweens });

	// This block helps determine empty index
	if (indexedBlockCount < 3) {
		result.push({ from: fromHeight, to: toHeight });
	} else if (indexedBlockCount !== totalNumOfBlocks) {
		const BATCH_SIZE = 25000;
		const NUM_BATCHES = Math.ceil((toHeight - fromHeight) / BATCH_SIZE);

		for (let i = 0; i < NUM_BATCHES; i++) {
			const batchStartHeight = fromHeight + i * BATCH_SIZE;
			const batchEndHeight = Math.min(batchStartHeight + BATCH_SIZE, toHeight);

			const missingBlocksQueryStatement = `
				SELECT
					(SELECT COALESCE(MAX(b0.height), ${batchStartHeight}) FROM blocks b0 WHERE b0.height < b1.height) AS 'from',
					(b1.height - 1) AS 'to'
				FROM blocks b1
				WHERE b1.height BETWEEN ${batchStartHeight} + 1 AND ${batchEndHeight}
					AND b1.height != ${batchEndHeight}
					AND NOT EXISTS (SELECT 1 FROM blocks b2 WHERE b2.height = b1.height - 1)
			`;

			logger.trace(
				`Checking for missing blocks between heights: ${batchStartHeight} - ${batchEndHeight}.`,
			);
			// eslint-disable-next-line no-await-in-loop
			const missingBlockRanges = await blocksTable.rawQuery(missingBlocksQueryStatement);
			logger.trace(
				`Found the following missing block ranges between heights: ${missingBlockRanges}.`,
			);

			result.push(...missingBlockRanges);
		}
	}

	result.forEach(({ from, to }) => logger.info(`Missing blocks in range: ${from}-${to} (${to - from + 1} blocks).`),
	);

	return result;
};

const getMissingBlocks = async params => {
	const missingBlockRanges = await findMissingBlocksInRange(params.from, params.to);
	// 'to + 1' as 'to' is non-inclusive
	const nestedListOfRanges = missingBlockRanges.map(entry => range(entry.from, entry.to + 1));
	const listOfMissingBlocks = nestedListOfRanges.flat();
	return listOfMissingBlocks;
};

const addHeightToIndexBlocksQueue = async (height, priority) => priority
	? indexBlocksQueue.add({ height }, { priority })
	: indexBlocksQueue.add({ height });

const setIndexVerifiedHeight = ({ height }) => keyValueTable.set(INDEX_VERIFIED_HEIGHT, height);

const getIndexVerifiedHeight = () => keyValueTable.get(INDEX_VERIFIED_HEIGHT);

const isGenesisBlockIndexed = async () => {
	const blocksTable = await getBlocksTable();
	const [{ height } = {}] = await blocksTable.find({ height: await getGenesisHeight(), limit: 1 }, [
		'height',
	]);

	return height !== undefined;
};

module.exports = {
	indexNewBlock,
	addHeightToIndexBlocksQueue,
	getMissingBlocks,
	scheduleBlockDeletion,
	setIndexVerifiedHeight,
	getIndexVerifiedHeight,
	getLiveIndexingJobCount,
	isGenesisBlockIndexed,
};
