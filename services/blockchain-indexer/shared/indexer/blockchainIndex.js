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
	// getEventsByHeight,
} = require('../dataService');

const {
	range,
} = require('../utils/arrayUtils');

const { getLisk32AddressFromPublicKey } = require('../utils/accountUtils');
const { normalizeTransaction } = require('../utils/transactionsUtils');

// const { getEventsInfoToIndex } = require('../utils/eventsUtils');

const { updateAddressBalanceQueue } = require('./tokenIndex');

const {
	getFinalizedHeight,
	getCurrentHeight,
	getGenesisHeight,
} = require('../constants');

const config = require('../../config');

const keyValueDB = require('../database/mysqlKVStore');

const accountsIndexSchema = require('../database/schema/accounts');
const blocksIndexSchema = require('../database/schema/blocks');
// const eventsIndexSchema = require('../database/schema/events');
// const eventTopicsIndexSchema = require('../database/schema/eventTopics');
const transactionsIndexSchema = require('../database/schema/transactions');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const logger = Logger();

const getAccountsIndex = () => getTableInstance(
	accountsIndexSchema.tableName,
	accountsIndexSchema,
	MYSQL_ENDPOINT,
);

const getBlocksIndex = () => getTableInstance(
	blocksIndexSchema.tableName,
	blocksIndexSchema,
	MYSQL_ENDPOINT,
);
// const getEventsIndex = () => getTableInstance(
// 	eventsIndexSchema.tableName,
// 	eventsIndexSchema,
// 	MYSQL_ENDPOINT,
// );
// const getEventTopicsIndex = () => getTableInstance(
// 	eventTopicsIndexSchema.tableName,
// 	eventTopicsIndexSchema,
// 	MYSQL_ENDPOINT,
// );
const getTransactionsIndex = () => getTableInstance(
	transactionsIndexSchema.tableName,
	transactionsIndexSchema,
	MYSQL_ENDPOINT,
);

const INDEX_VERIFIED_HEIGHT = 'indexVerifiedHeight';

// const getGeneratorPkInfoArray = async (blocks) => {
// 	const blocksDB = await getBlocksIndex();
// 	const pkInfoArray = [];
// 	await BluebirdPromise.map(
// 		blocks,
// 		async block => {
// 			const [blockInfo] = await blocksDB.find({ id: block.id, limit: 1 }, ['id']);
// 			pkInfoArray.push({
// 				publicKey: block.generatorPublicKey,
// 				reward: block.reward,
// 				isForger: true,
// 				isBlockIndexed: !!blockInfo,
// 			});
// 		},
// 		{ concurrency: blocks.length },
// 	);
// 	return pkInfoArray;
// };

const validateBlock = (block) => !!block && block.height >= 0;

const indexBlock = async job => {
	const { block } = job.data;
	const blocksDB = await getBlocksIndex();
	// const events = await getEventsByHeight(height);

	if (!validateBlock(block)) throw new Error(`Error: Invalid block ${block.id} at height ${block.height} }`);

	const connection = await getDbConnection();
	const dbTrx = await startDbTransaction(connection);
	logger.debug(`Created new MySQL transaction to index block ${block.id} at height ${block.height}`);

	try {
		if (block.transactions.length) {
			const { transactions, assets, ...blockHeader } = block;

			const accountsDB = await getAccountsIndex();
			const transactionsDB = await getTransactionsIndex();
			await BluebirdPromise.map(
				block.transactions,
				async (tx) => {
					// Apply default transformations and index with minimal information by default
					tx.moduleCommand = `${tx.module}:${tx.command}`;
					tx.blockID = block.id;
					tx.height = block.height;
					tx.senderAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);
					tx.timestamp = block.timestamp;

					await updateAddressBalanceQueue.add({ address: tx.senderAddress });

					// Store address -> publicKey mapping
					const account = { address: tx.senderAddress, publicKey: tx.senderPublicKey };
					accountsDB.upsert(account);

					await transactionsDB.upsert(tx, dbTrx);

					// Invoke 'applyTransaction' to execute command specific processing logic
					await applyTransaction(blockHeader, tx, dbTrx);
				},
				{ concurrency: block.transactions.length },
			);
		}

		// TODO: Enable events indexing logic when chain_getEvents is available
		// if (events.length) {
		// 	const eventsDB = await getEventsIndex();
		// 	const eventTopicsDB = await getEventTopicsIndex();

		// 	const { eventsInfo, eventTopicsInfo } = await getEventsInfoToIndex(block.header, events);
		// 	await eventsDB.upsert(eventsInfo, dbTrx);
		// 	await eventTopicsDB.upsert(eventTopicsInfo, dbTrx);
		// }

		if (block.generatorAddress) {
			await updateAddressBalanceQueue.add({ address: block.generatorAddress });
		}

		// TODO: Fetch reward from events
		const blockToIndex = {
			...block,
			assetsModules: block.assets.map(asset => asset.module),
			numberOfEvents: 1,
			reward: BigInt('0'),
			// numberOfEvents: events.length,
		};

		await blocksDB.upsert(blockToIndex, dbTrx);
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
		throw error;
	}
};

const updateBlockIndex = async job => {
	const blocksDB = await getBlocksIndex();
	const { blocks } = job.data;
	await blocksDB.upsert(blocks);
};

const deleteIndexedBlocks = async job => {
	const { blocks } = job.data;
	const blockIDs = blocks.map(b => b.id).join(', ');

	const blocksDB = await getBlocksIndex();
	const connection = await getDbConnection();
	const dbTrx = await startDbTransaction(connection);
	logger.trace(`Created new MySQL transaction to delete block(s) with ID(s): ${blockIDs}`);
	try {
		await BluebirdPromise.map(
			blocks,
			async block => {
				let forkedTransactions;
				const transactionsDB = await getTransactionsIndex();

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
				await transactionsDB.deleteByPrimaryKey(forkedTransactionIDs, dbTrx);
				Signals.get('deleteTransactions').dispatch({ data: forkedTransactions });
			});

		await blocksDB.deleteByPrimaryKey(blockIDs);
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
const indexBlocksQueue = Queue(config.endpoints.cache, 'indexBlocksQueue', indexBlock, 30);
const updateBlockIndexQueue = Queue(config.endpoints.cache, 'updateBlockIndexQueue', updateBlockIndex, 1);
const deleteIndexedBlocksQueue = Queue(config.endpoints.cache, 'deleteIndexedBlocksQueue', deleteIndexedBlocks, 1);

const deleteBlock = async (block) => deleteIndexedBlocksQueue.add({ blocks: [block] });

const indexNewBlock = async block => {
	const blocksDB = await getBlocksIndex();
	logger.info(`Indexing new block: ${block.id} at height ${block.height}`);

	const [blockInfo] = await blocksDB.find({ height: block.height, limit: 1 }, ['id', 'isFinal']);
	if (!blockInfo || (!blockInfo.isFinal && block.isFinal)) {
		// Index if doesn't exist, or update if it isn't set to final
		await indexBlocksQueue.add({ block });

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

const getMinNonFinalHeight = async () => {
	const blocksDB = await getBlocksIndex();

	const [{ height: lastIndexedHeight } = {}] = await blocksDB.find({
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
	const blocksDB = await getBlocksIndex();
	const genesisHeight = await getGenesisHeight();
	const [block] = await blocksDB.find({ height: genesisHeight, limit: 1 }, ['height']);
	return !!block;
};

const addBlockToQueue = async height => {
	const block = await getBlockByHeight(height);
	indexBlocksQueue.add({ block });
};

const setIndexVerifiedHeight = ({ height }) => keyValueDB.set(INDEX_VERIFIED_HEIGHT, height);

const getIndexVerifiedHeight = () => keyValueDB.get(INDEX_VERIFIED_HEIGHT);

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
