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
		},
	},
	Utils: { waitForIt },
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
const { getGenesisAssetIntervalTimeout, indexGenesisBlockAssets } = require('./genesisBlock');
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

const logger = Logger();

const getBlocksTable = () => getTableInstance(blocksTableSchema, MYSQL_ENDPOINT);
const getEventsTable = () => getTableInstance(eventsTableSchema, MYSQL_ENDPOINT);
const getEventTopicsTable = () => getTableInstance(eventTopicsTableSchema, MYSQL_ENDPOINT);
const getTransactionsTable = () => getTableInstance(transactionsTableSchema, MYSQL_ENDPOINT);
const getValidatorsTable = () => getTableInstance(validatorsTableSchema, MYSQL_ENDPOINT);

const validateBlock = block => !!block && block.height >= 0;

const DB_STATUS = Object.freeze({
	COMMIT: 'commit',
	ROLLBACK: 'rollback',
});

// eslint-disable-next-line consistent-return
const checkBlockHeightIndexStatusInDB = async (blockHeight, status) => {
	const blocksTable = await getBlocksTable();
	const [{ height } = {}] = await blocksTable.find({ height: blockHeight }, ['height']);

	const isCommit = DB_STATUS.COMMIT === status;
	const isRollback = DB_STATUS.ROLLBACK === status;

	if ((isCommit && height === blockHeight) || (isRollback && height === undefined)) {
		logger.debug(`Block at height ${blockHeight} is ${isCommit ? 'committed' : 'rolled back'}.`);
		return true;
	}

	logger.debug(
		`Block at height ${blockHeight} is not yet ${isCommit ? 'committed' : 'rolled back'}.`,
	);
};

// eslint-disable-next-line consistent-return
const checkBlockIDsDeleteStatusInDB = async (blockIDs, status) => {
	const blocksTable = await getBlocksTable();
	const resultSet = await blocksTable.find({ whereIn: { property: 'id', values: blockIDs } });
	const numResults = resultSet.length;

	const isCommit = DB_STATUS.COMMIT === status;
	const isRollback = DB_STATUS.ROLLBACK === status;

	const blockIDString = blockIDs.join(' ,');
	if ((isCommit && numResults === 0) || (isRollback && numResults !== 0)) {
		logger.debug(`Deleting block(s) ${blockIDString} ${isCommit ? 'committed' : 'rolled back'}.`);
		return true;
	}

	logger.debug(
		`Deleting block(s) ${blockIDString} not yet ${isCommit ? 'committed' : 'rolled back'}.`,
	);
};

const indexBlock = async job => {
	const { height: blockHeightFromJobData } = job.data;
	let blockHeightToIndex = blockHeightFromJobData;
	let addressesToUpdateBalance = [];
	let dbTrx;
	let blockToIndexFromNode;

	const genesisHeight = await getGenesisHeight();
	try {
		const blocksTable = await getBlocksTable();

		const [lastIndexedBlock = {}] = await blocksTable.find(
			{
				sort: 'height:desc',
				limit: 1,
			},
			['height'],
		);

		const { height: lastIndexedHeight } = lastIndexedBlock;

		// Always index the last indexed blockHeight + 1 (sequential indexing)
		if (typeof lastIndexedHeight !== 'undefined') {
			blockHeightToIndex = lastIndexedHeight + 1;

			// Skip job run if the height to be indexed does not exist
			if ((await getCurrentHeight()) < blockHeightToIndex) return;
		}

		const [currentBlockInDB = {}] = await blocksTable.find(
			{
				where: { height: blockHeightToIndex },
				limit: 1,
			},
			['id', 'height'],
		);

		let prevBlockInDB = {};
		if (blockHeightToIndex > genesisHeight + 1) {
			[prevBlockInDB] = await blocksTable.find(
				{
					where: { height: blockHeightToIndex - 1 },
					limit: 1,
				},
				['id', 'height'],
			);
		}

		// Get block from node
		blockToIndexFromNode = await getBlockByHeight(blockHeightToIndex);
		if (!validateBlock(blockToIndexFromNode)) {
			throw new Error(
				`Invalid block ${blockToIndexFromNode.id} at height ${blockToIndexFromNode.height}.`,
			);
		}

		// If current index block is incorrectly indexed then schedule for deletion
		/* eslint-disable no-use-before-define */
		if (Object.keys(currentBlockInDB).length && blockToIndexFromNode.id !== currentBlockInDB.id) {
			await scheduleBlockDeletion(currentBlockInDB);
			await addHeightToIndexBlocksQueue(currentBlockInDB.height);
			return;
		}

		// Incase prev block is incorrect schedule that for deletion
		if (
			Object.keys(prevBlockInDB).length &&
			prevBlockInDB.id !== blockToIndexFromNode.previousBlockID
		) {
			await scheduleBlockDeletion(prevBlockInDB);
			await addHeightToIndexBlocksQueue(prevBlockInDB.height);
			return;
		}
		/* eslint-enable no-use-before-define */

		// If current block is already indexed, then index the highest indexed block height + 1
		if (Object.keys(currentBlockInDB).length) {
			// Skip indexing if the blockchain is fully indexed.
			const currentBlockchainHeight = await getCurrentHeight();
			if (lastIndexedHeight >= currentBlockchainHeight) return;

			blockHeightToIndex = lastIndexedHeight + 1;
		}

		// Create DB transaction. Queries from here sees a snapshot of the database
		const connection = await getDBConnection(MYSQL_ENDPOINT);
		dbTrx = await startDBTransaction(connection);
		logger.debug(
			`Created new MySQL transaction to index block ${blockToIndexFromNode.id} at height ${blockToIndexFromNode.height}.`,
		);

		let blockReward = BigInt('0');

		if (blockToIndexFromNode.height === genesisHeight) {
			await indexGenesisBlockAssets(dbTrx);
		}

		const events = await getEventsByHeight(blockToIndexFromNode.height);
		cacheEventsByBlockID(blockToIndexFromNode.id, events);

		if (blockToIndexFromNode.transactions.length) {
			const { transactions, assets, ...blockHeader } = blockToIndexFromNode;

			const transactionsTable = await getTransactionsTable();
			await BluebirdPromise.map(
				blockToIndexFromNode.transactions,
				async (tx, index) => {
					// Apply default transformations and index with minimal information by default
					tx.index = index;
					tx.moduleCommand = `${tx.module}:${tx.command}`;
					tx.blockID = blockToIndexFromNode.id;
					tx.height = blockToIndexFromNode.height;
					tx.senderAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);
					tx.timestamp = blockToIndexFromNode.timestamp;
					tx.executionStatus = getTransactionExecutionStatus(tx, events);

					// Store address -> publicKey mapping
					indexAccountPublicKey(tx.senderPublicKey);

					await transactionsTable.upsert(tx, dbTrx);

					// Invoke 'applyTransaction' to execute command specific processing logic
					await applyTransaction(blockHeader, tx, events, dbTrx);
				},
				{ concurrency: blockToIndexFromNode.transactions.length },
			);
		}

		// Update generatedBlocks count for the block generator
		const validatorsTable = await getValidatorsTable();
		const numRowsAffected = await validatorsTable.increment(
			{
				increment: { generatedBlocks: 1 },
				where: { address: blockToIndexFromNode.generatorAddress },
			},
			dbTrx,
		);
		if (numRowsAffected === 0) {
			await validatorsTable.upsert(
				{
					address: blockToIndexFromNode.generatorAddress,
					generatedBlocks: 1,
				},
				dbTrx,
			);
		}

		if (events.length) {
			const eventsTable = await getEventsTable();
			const eventTopicsTable = await getEventTopicsTable();

			const { eventsInfo, eventTopicsInfo } = getEventsInfoToIndex(blockToIndexFromNode, events);
			await eventsTable.upsert(eventsInfo, dbTrx);
			await eventTopicsTable.upsert(eventTopicsInfo, dbTrx);

			// Update block generator's rewards
			const blockRewardEvent = events.find(
				e =>
					[MODULE.REWARD, MODULE.DYNAMIC_REWARD].includes(e.module) &&
					e.name === EVENT.REWARD_MINTED,
			);
			if (blockRewardEvent) {
				blockReward = BigInt(blockRewardEvent.data.amount || '0');

				if (blockReward !== BigInt('0')) {
					const commissionAmount = await calcCommissionAmount(
						blockToIndexFromNode.generatorAddress,
						blockToIndexFromNode.height,
						blockReward,
					);
					const selfStakeReward = await calcSelfStakeReward(
						blockToIndexFromNode.generatorAddress,
						blockReward,
						commissionAmount,
					);

					logger.trace(
						`Increasing commission for validator ${blockToIndexFromNode.generatorAddress} by ${commissionAmount}.`,
					);
					await validatorsTable.increment(
						{
							increment: { totalCommission: BigInt(commissionAmount) },
							where: { address: blockToIndexFromNode.generatorAddress },
						},
						dbTrx,
					);
					logger.debug(
						`Increased commission for validator ${blockToIndexFromNode.generatorAddress} by ${commissionAmount}.`,
					);
					logger.trace(
						`Increasing self-stake rewards for validator ${blockToIndexFromNode.generatorAddress} by ${selfStakeReward}.`,
					);
					await validatorsTable.increment(
						{
							increment: { totalSelfStakeRewards: BigInt(selfStakeReward) },
							where: { address: blockToIndexFromNode.generatorAddress },
						},
						dbTrx,
					);
					logger.debug(
						`Increased self-stake rewards for validator ${blockToIndexFromNode.generatorAddress} by ${selfStakeReward}.`,
					);
				}
			}

			// Calculate locked amount change and update in key_value_store table for affected tokens
			const tokenIDLockedAmountChangeMap = {};
			events.forEach(event => {
				const { data: eventData } = event;
				// Initialize map entry with BigInt
				if (
					[EVENT.LOCK, EVENT.UNLOCK].includes(event.name) &&
					!(eventData.tokenID in tokenIDLockedAmountChangeMap)
				) {
					tokenIDLockedAmountChangeMap[eventData.tokenID] = BigInt('0');
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
			...blockToIndexFromNode,
			assetsModules: blockToIndexFromNode.assets.map(asset => asset.module),
			numberOfEvents: events.length,
			reward: blockReward,
		};

		await blocksTable.upsert(blockToIndex, dbTrx);
		await commitDBTransaction(dbTrx);
		logger.debug(
			`Committed MySQL transaction to index block ${blockToIndexFromNode.id} at height ${blockToIndexFromNode.height}.`,
		);

		// Add safety check to ensure that the DB transaction is actually committed
		await waitForIt(
			checkBlockHeightIndexStatusInDB.bind(null, blockToIndexFromNode.height, DB_STATUS.COMMIT),
			config.db.durabilityVerifyFrequency,
		);

		// Only schedule address balance updates if the block is indexed successfully
		await scheduleAddressesBalanceUpdate(addressesToUpdateBalance);
		logger.info(
			`Successfully indexed block ${blockToIndexFromNode.id} at height ${blockToIndexFromNode.height}.`,
		);
	} catch (error) {
		// Stop genesisAsset index progress logging on errors
		clearInterval(getGenesisAssetIntervalTimeout());

		// Block may not have been initialized when error occurred
		const failedBlockInfo = {
			id: typeof blockToIndexFromNode === 'undefined' ? undefined : blockToIndexFromNode.id,
			height:
				typeof blockToIndexFromNode === 'undefined'
					? blockHeightToIndex
					: blockToIndexFromNode.height,
		};

		// Processing may fail before a transaction is created
		if (dbTrx) {
			await rollbackDBTransaction(dbTrx);
			logger.debug(
				failedBlockInfo.id
					? `Rolled back MySQL transaction to index block ${failedBlockInfo.id} at height ${failedBlockInfo.height}.`
					: `Rolled back MySQL transaction to index block at height ${failedBlockInfo.height}.`,
			);

			// Add safety check to ensure that the DB transaction is rolled back successfully
			await waitForIt(
				checkBlockHeightIndexStatusInDB.bind(null, blockToIndexFromNode.height, DB_STATUS.ROLLBACK),
				config.db.durabilityVerifyFrequency,
			);
		}

		if (
			['Deadlock found when trying to get lock', 'ER_LOCK_DEADLOCK'].some(e =>
				error.message.includes(e),
			)
		) {
			const errMessage = failedBlockInfo.id
				? `Deadlock encountered while indexing block ${failedBlockInfo.id} at height ${failedBlockInfo.height}. Will retry.`
				: `Deadlock encountered while indexing block at height ${failedBlockInfo.height}. Will retry.`;
			logger.warn(errMessage);
			logger.debug(`SQL query: ${error.sql}`);

			throw new Error(errMessage);
		}

		logger.warn(
			failedBlockInfo.id
				? `Error occurred while indexing block ${failedBlockInfo.id} at height ${failedBlockInfo.height}. Will retry.`
				: `Error occurred while indexing block at height ${failedBlockInfo.height}. Will retry.`,
		);
		logger.debug(error.stack);
		throw error;
	}
};

// Returns a list of all indexed blocks since the minimum block height from job
const getBlocksToDelete = async blocks => {
	if (!blocks.length) {
		return blocks;
	}

	const blocksTable = await getBlocksTable();
	const minBlockHeight = Math.min(...blocks.map(b => b.height));

	const blocksToRemove = await blocksTable.find(
		{
			propBetweens: [
				{
					property: 'height',
					greaterThanEqualTo: minBlockHeight,
				},
			],
			sort: 'height:desc',
		},
		['id', 'height', 'generatorAddress', 'timestamp', 'isFinal'],
	);

	return blocksToRemove;
};

const deleteIndexedBlocks = async job => {
	let addressesToUpdateBalance = [];
	const { blocks: blocksFromJob } = job.data;
	const blocksToDelete = await getBlocksToDelete(blocksFromJob);
	const blockIDs = blocksToDelete.map(b => b.id);

	const blocksTable = await getBlocksTable();
	const connection = await getDBConnection(MYSQL_ENDPOINT);
	const dbTrx = await startDBTransaction(connection);
	logger.trace(`Created new MySQL transaction to delete block(s) with ID(s): ${blockIDs}.`);

	let blockReward = BigInt('0');

	try {
		await BluebirdPromise.map(
			blocksToDelete,
			async blockFromJob => {
				// Check if the deleted block is indexed
				const [blockFromDB] = await blocksTable.find({ height: blockFromJob.height, limit: 1 });

				// Skip deletion if the block was not indexed previously. The fork doesn't have any impact on block indexing in this case.
				if (!blockFromDB) {
					logger.info(
						`Deleted block ${blockFromJob.id} at height ${blockFromJob.height} was not previously indexed. Nothing to update.`,
					);
					return;
				}

				let { data: forkedTransactions } = await getTransactionsByBlockID(blockFromJob.id);
				const transactionsTable = await getTransactionsTable();
				const events = await getEventsByBlockID(blockFromJob.id);

				if (Array.isArray(forkedTransactions)) {
					const { assets, ...blockHeader } = blockFromJob;

					// Invoke 'revertTransaction' to execute command specific reverting logic
					await BluebirdPromise.map(
						forkedTransactions,
						async tx => revertTransaction(blockHeader, tx, events, dbTrx),
						{ concurrency: 1 },
					);
				}

				const forkedTransactionIDs = await getTransactionIDsByBlockID(blockFromJob.id);
				if (!Array.isArray(forkedTransactions)) {
					const transactionsToDelete = await BluebirdPromise.map(
						forkedTransactionIDs,
						async txID => {
							const transaction = await getTransactions({ id: txID });
							return transaction.data ? transaction.data[0] : null;
						},
						{ concurrency: 25 },
					);
					forkedTransactions = transactionsToDelete.filter(t => ![null, undefined].includes(t));
				}
				if (forkedTransactionIDs.length) {
					await transactionsTable.deleteByPrimaryKey(forkedTransactionIDs, dbTrx);
					Signals.get('deleteTransactions').dispatch({
						data: forkedTransactions,
						meta: { offset: 0, count: forkedTransactions.length, total: forkedTransactions.length },
					});
				}

				// Update generatedBlocks count for the block generator
				const validatorsTable = await getValidatorsTable();
				logger.trace(
					`Decreasing generatedBlocks for validator ${blockFromJob.generatorAddress} by 1.`,
				);
				await validatorsTable.decrement(
					{
						decrement: { generatedBlocks: 1 },
						where: { address: blockFromJob.generatorAddress },
					},
					dbTrx,
				);
				logger.debug(
					`Decreased generatedBlocks for validator ${blockFromJob.generatorAddress} by 1.`,
				);

				// Calculate locked amount change from events and update in key_value_store table
				if (events.length) {
					const eventsTable = await getEventsTable();
					const eventTopicsTable = await getEventTopicsTable();

					const { eventsInfo } = getEventsInfoToIndex(blockFromJob, events);
					const eventIDs = eventsInfo.map(e => e.id);

					await eventTopicsTable.delete(
						{ whereIn: { property: 'eventID', values: eventIDs } },
						dbTrx,
					);
					await eventsTable.deleteByPrimaryKey(eventIDs, dbTrx);

					// Update block generator's rewards
					const blockRewardEvent = events.find(
						e =>
							[MODULE.REWARD, MODULE.DYNAMIC_REWARD].includes(e.module) &&
							e.name === EVENT.REWARD_MINTED,
					);
					if (blockRewardEvent) {
						blockReward = BigInt(blockRewardEvent.data.amount || '0');

						if (blockReward !== BigInt('0')) {
							const commissionAmount = await calcCommissionAmount(
								blockFromJob.generatorAddress,
								blockFromJob.height,
								blockReward,
							);
							const selfStakeReward = await calcSelfStakeReward(
								blockFromJob.generatorAddress,
								blockReward,
								commissionAmount,
							);

							logger.trace(
								`Decreasing commission for validator ${blockFromJob.generatorAddress} by ${commissionAmount}.`,
							);
							await validatorsTable.decrement(
								{
									decrement: { totalCommission: BigInt(commissionAmount) },
									where: { address: blockFromJob.generatorAddress },
								},
								dbTrx,
							);
							logger.debug(
								`Decreased commission for validator ${blockFromJob.generatorAddress} by ${commissionAmount}.`,
							);
							logger.trace(
								`Decreasing self-stake rewards for validator ${blockFromJob.generatorAddress} by ${selfStakeReward}.`,
							);
							await validatorsTable.decrement(
								{
									decrement: { totalSelfStakeRewards: BigInt(selfStakeReward) },
									where: { address: blockFromJob.generatorAddress },
								},
								dbTrx,
							);
							logger.debug(
								`Decreased self-stake rewards for validator ${blockFromJob.generatorAddress} by ${selfStakeReward}.`,
							);
						}
					}

					// Calculate locked amount change and update in key_value_store table for affected tokens
					const tokenIDLockedAmountChangeMap = {};
					events.forEach(event => {
						const { data: eventData } = event;
						// Initialize map entry with BigInt
						if (
							[EVENT.LOCK, EVENT.UNLOCK].includes(event.name) &&
							!(eventData.tokenID in tokenIDLockedAmountChangeMap)
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

				// Invalidate cached events for this block. Must be done after processing all event related calculations
				await deleteEventsFromCacheByBlockID(blockFromJob.id);
			},
			{ concurrency: 1 },
		);

		await blocksTable.delete({ whereIn: { property: 'id', values: blockIDs } }, dbTrx);
		await commitDBTransaction(dbTrx);

		// Add safety check to ensure that the DB transaction is actually committed
		await waitForIt(
			checkBlockIDsDeleteStatusInDB.bind(null, blockIDs, DB_STATUS.COMMIT),
			config.db.durabilityVerifyFrequency,
		);

		// Only schedule address balance updates if the block is deleted successfully
		await scheduleAddressesBalanceUpdate(addressesToUpdateBalance);
		logger.debug(`Committed MySQL transaction to delete block(s) with ID(s): ${blockIDs}.`);
	} catch (error) {
		logger.debug(`Rolled back MySQL transaction to delete block(s) with ID(s): ${blockIDs}.`);
		await rollbackDBTransaction(dbTrx);

		// Add safety check to ensure that the DB transaction is actually rolled back
		await waitForIt(
			checkBlockIDsDeleteStatusInDB.bind(null, blockIDs, DB_STATUS.ROLLBACK),
			config.db.durabilityVerifyFrequency,
		);

		if (error.message.includes('ER_LOCK_DEADLOCK')) {
			const errMessage = `Deadlock encountered while deleting block(s) with ID(s): ${blockIDs}. Will retry later.`;
			logger.warn(errMessage);
			throw new Error(errMessage);
		}

		logger.warn(
			`Deleting block(s) with ID(s): ${blockIDs} failed due to: ${error.message}. Will retry.`,
		);
		logger.warn(error.stack);
		throw error;
	}
};

const deleteIndexedBlocksWrapper = async job => {
	/* eslint-disable no-use-before-define */
	try {
		if (!(await indexBlocksQueue.queue.isPaused())) {
			await indexBlocksQueue.queue.pause();
		}
		await deleteIndexedBlocks(job);
	} catch (err) {
		if (job.attemptsMade === job.opts.attempts - 1) {
			await scheduleBlockDeletion(job.data.blocks);
		}
	} finally {
		// Resume indexing once all deletion jobs are processed
		if ((await getPendingDeleteJobCount()) === 0) {
			await indexBlocksQueue.queue.resume();
		}
	}
	/* eslint-enable no-use-before-define */
};

// Initialize queues
let indexBlocksQueue;
let deleteIndexedBlocksQueue;

const initBlockProcessingQueues = async () => {
	indexBlocksQueue = Queue(
		config.endpoints.cache,
		config.queue.indexBlocks.name,
		indexBlock,
		config.queue.indexBlocks.concurrency,
	);

	deleteIndexedBlocksQueue = Queue(
		config.endpoints.cache,
		config.queue.deleteIndexedBlocks.name,
		deleteIndexedBlocksWrapper,
		config.queue.deleteIndexedBlocks.concurrency,
	);
};

const getLiveIndexingJobCount = async () => {
	if (!indexBlocksQueue || !deleteIndexedBlocksQueue) return 0;

	const { queue: indexBlocksBullQueue } = indexBlocksQueue;
	const { queue: deleteIndexedBlocksBullQueue } = deleteIndexedBlocksQueue;

	const jcIndexBlocksQueue = await indexBlocksBullQueue.getJobCounts();
	const jcDeleteIndexedBlocksQueue = await deleteIndexedBlocksBullQueue.getJobCounts();

	const count =
		jcIndexBlocksQueue.active +
		jcIndexBlocksQueue.waiting +
		jcDeleteIndexedBlocksQueue.active +
		jcDeleteIndexedBlocksQueue.waiting;
	return count;
};

const getPendingDeleteJobCount = async () => {
	const { queue: bullQueue } = deleteIndexedBlocksQueue;
	const jobCount = await bullQueue.getWaitingCount();
	return jobCount;
};

const scheduleBlockDeletion = async block => {
	const blocks = Array.isArray(block) ? block : [block];
	await deleteIndexedBlocksQueue.add({ blocks });
};

const indexNewBlock = async block => {
	const blocksTable = await getBlocksTable();
	logger.info(`Scheduling indexing of new block: ${block.id} at height ${block.height}.`);

	const [blockFromDB] = await blocksTable.find({ height: block.height, limit: 1 }, [
		'id',
		'height',
		'generatorAddress',
		'timestamp',
		'isFinal',
	]);

	// Schedule block deletion in case of an unprocessed fork detection
	if (blockFromDB && blockFromDB.id !== block.id) {
		logger.info(
			`Fork detected while scheduling indexing at height: ${block.height}. Actual blockID: ${block.id}, indexed blockID: ${blockFromDB.id}.`,
		);

		await scheduleBlockDeletion(blockFromDB);
	}

	// Schedule indexing of the incoming block if not already indexed or a fork was detected
	if (!blockFromDB || blockFromDB.id !== block.id) {
		await indexBlocksQueue.add({ height: block.height });
	}

	// Update finality status of indexed blocks
	const finalizedBlockHeight = await getFinalizedHeight();
	await blocksTable.update({
		where: {
			isFinal: false,
			propBetweens: [
				{
					property: 'height',
					lowerThanEqualTo: finalizedBlockHeight,
				},
			],
		},
		updates: { isFinal: true },
	});
};

const findMissingBlocksInRange = async (fromHeight, toHeight) => {
	const result = [];

	const totalNumOfBlocks = toHeight - fromHeight + 1;
	logger.info(
		`Checking for missing blocks between height ${fromHeight}-${toHeight} (${totalNumOfBlocks} blocks).`,
	);

	const blocksTable = await getBlocksTable();
	const propBetweens = [{ property: 'height', from: fromHeight, to: toHeight }];
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
					(SELECT COALESCE(MAX(b0.height + 1), ${batchStartHeight}) FROM blocks b0 WHERE b0.height < b1.height) AS 'from',
					(b1.height - 1) AS 'to'
				FROM blocks b1
				WHERE b1.height BETWEEN ${batchStartHeight} + 1 AND ${batchEndHeight}
					AND b1.height != ${batchEndHeight}
					AND NOT EXISTS (SELECT 1 FROM blocks b2 WHERE b2.height = b1.height - 1)
			`;

			logger.trace(
				`Checking for missing blocks between heights: ${batchStartHeight} - ${batchEndHeight}.`,
			);
			const missingBlockRanges = await blocksTable.rawQuery(missingBlocksQueryStatement);
			logger.trace(
				`Found the following missing block ranges between heights: ${missingBlockRanges}.`,
			);

			result.push(...missingBlockRanges);
		}
	}

	result.forEach(({ from, to }) =>
		logger.info(`Missing blocks in range: ${from}-${to} (${to - from + 1} blocks).`),
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

const addHeightToIndexBlocksQueue = async (height, priority) => {
	const liveIndexingJobCount = await getLiveIndexingJobCount();
	if (liveIndexingJobCount > config.queue.indexBlocks.scheduledJobsMaxCount) {
		logger.trace(
			`Skipping adding new job to the queue. Current liveIndexingJobCount: ${liveIndexingJobCount}.`,
		);
		return null;
	}

	return typeof priority === 'number'
		? indexBlocksQueue.add({ height }, { priority })
		: indexBlocksQueue.add({ height });
};

const getIndexVerifiedHeight = async () => {
	const blocksTable = await getBlocksTable();
	const [lastIndexedFinalBlock = {}] = await blocksTable.find(
		{
			isFinal: true,
			sort: 'height:desc',
			limit: 1,
		},
		['height'],
	);

	return lastIndexedFinalBlock.height || null;
};

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
	getIndexVerifiedHeight,
	getLiveIndexingJobCount,
	isGenesisBlockIndexed,
	initBlockProcessingQueues,
};
