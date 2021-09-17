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
const BluebirdPromise = require('bluebird');
const util = require('util');
const {
	CacheRedis,
	Logger,
	Exceptions: { ValidationException, NotFoundException },
} = require('lisk-service-framework');

const Signals = require('../../../signals');

const coreApi = require('./coreApi');
const config = require('../../../../config');

const {
	indexAccountsbyPublicKey,
	getIndexedAccountInfo,
	indexAccountsbyAddress,
} = require('./accounts');

const {
	indexVotes,
} = require('./voters');

const {
	indexTransactions,
	removeTransactionsByBlockIDs,
} = require('./transactions');

const {
	getApiClient,
	getIndexReadyStatus,
	setIndexReadyStatus,
	setIsSyncFullBlockchain,
} = require('../common');

const { initializeQueue } = require('../../queue');
const { parseToJSONCompatObj } = require('../../../jsonTools');

const mysqlIndex = require('../../../indexdb/mysql');
const blocksIndexSchema = require('./schema/blocks');
const accountsIndexSchema = require('./schema/accounts');

const getBlocksIndex = () => mysqlIndex('blocks', blocksIndexSchema);
const getAccountsIndex = () => mysqlIndex('accounts', accountsIndexSchema);

const legacyAccountCache = CacheRedis('legacyAccount', config.endpoints.redis);
const genesisAccountsCache = CacheRedis('genesisAccounts', config.endpoints.redis);
const latestBlockCache = CacheRedis('latestBlock', config.endpoints.redis);

const logger = Logger();

const requestApi = coreApi.requestRetry;

let latestBlock;
let genesisHeight;
let finalizedHeight;
let indexStartHeight;
let indexVerifiedHeight; // Height below which there are no missing blocks in the index

let genesisAccountsToIndex;
let genesisAccountIndexingBatchNum = -1;
let isGenesisAccountsIndexingInProgress = false;

const setGenesisHeight = (height) => genesisHeight = height;

const getGenesisHeight = () => genesisHeight;

const setFinalizedHeight = (height) => finalizedHeight = height;

const getFinalizedHeight = () => finalizedHeight;

const setIndexStartHeight = (height) => indexStartHeight = height;

const getIndexStartHeight = () => indexStartHeight;

const updateFinalizedHeight = async () => {
	const result = await requestApi(coreApi.getNetworkStatus);
	setFinalizedHeight(result.data.finalizedHeight);
	return result;
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

const indexBlocks = async job => {
	const { blocks } = job.data;
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

const indexBlocksQueue = initializeQueue('indexBlocksQueue', indexBlocks);
const updateBlockIndexQueue = initializeQueue('updateBlockIndexQueue', updateBlockIndex);
const deleteIndexedBlocksQueue = initializeQueue('deleteIndexedBlocksQueue', deleteIndexedBlocks);

const normalizeBlocks = async (blocks, isIgnoreGenesisAccounts = true) => {
	const apiClient = await getApiClient();

	const normalizedBlocks = await BluebirdPromise.map(
		blocks.map(block => ({ ...block.header, payload: block.payload })),
		async block => {
			const account = block.generatorPublicKey
				? await getIndexedAccountInfo({ publicKey: block.generatorPublicKey.toString('hex'), limit: 1 }, ['address', 'username'])
				: {};
			block.generatorAddress = account && account.address ? account.address : null;
			block.generatorUsername = account && account.username ? account.username : null;
			block.isFinal = block.height <= getFinalizedHeight();
			block.numberOfTransactions = block.payload.length;

			block.size = 0;
			block.totalForged = BigInt(block.reward);
			block.totalBurnt = BigInt('0');
			block.totalFee = BigInt('0');

			block.payload.forEach(txn => {
				txn.size = apiClient.transaction.encode(txn).length;
				txn.minFee = apiClient.transaction.computeMinFee(txn);

				block.size += txn.size;

				const txnMinFee = BigInt(txn.minFee);
				block.totalForged += BigInt(txn.fee);
				block.totalBurnt += txnMinFee;
				block.totalFee += BigInt(txn.fee) - txnMinFee;
			});

			if (isIgnoreGenesisAccounts) {
				const {
					accounts,
					initRounds,
					initDelegates,
					...otherAssets
				} = block.asset;

				block.asset = { ...otherAssets };
			}

			return parseToJSONCompatObj(block);
		},
		{ concurrency: blocks.length },
	);

	return normalizedBlocks;
};

const getBlockByID = async id => {
	const response = await requestApi(coreApi.getBlockByID, id);
	return normalizeBlocks(response.data);
};

const getBlocksByIDs = async ids => {
	const response = await requestApi(coreApi.getBlocksByIDs, ids);
	return normalizeBlocks(response.data);
};

const getBlockByHeight = async (height, isIgnoreGenesisAccounts = true) => {
	const response = await requestApi(coreApi.getBlockByHeight, height);
	return normalizeBlocks(response.data, isIgnoreGenesisAccounts);
};

const getBlocksByHeightBetween = async (from, to) => {
	const response = await requestApi(coreApi.getBlocksByHeightBetween, { from, to });
	return normalizeBlocks(response.data);
};

const getLastBlock = async () => {
	const response = await requestApi(coreApi.getLastBlock);
	[latestBlock] = await normalizeBlocks(response.data);
	if (latestBlock && latestBlock.id) await latestBlockCache.set('latestBlock', JSON.stringify(latestBlock));
	return [latestBlock];
};

const isQueryFromIndex = params => {
	const paramProps = Object.getOwnPropertyNames(params);

	const directQueryParams = ['id', 'height', 'heightBetween'];
	const defaultQueryParams = ['limit', 'offset', 'sort'];

	// For 'isDirectQuery' to be 'true', the request params should contain
	// exactly one of 'directQueryParams' and all of them must be contained
	// within 'directQueryParams' or 'defaultQueryParams'
	const isDirectQuery = (paramProps.filter(prop => directQueryParams.includes(prop))).length === 1
		&& paramProps.every(prop => directQueryParams.concat(defaultQueryParams).includes(prop));

	const sortOrder = params.sort ? params.sort.split(':')[1] : undefined;
	const isLatestBlockFetch = (paramProps.length === 1 && params.limit === 1)
		|| (paramProps.length === 2
			&& ((params.limit === 1 && params.offset === 0)
				|| (sortOrder === 'desc' && (params.limit === 1 || params.offset === 0))
			))
		|| (paramProps.length === 3 && params.limit === 1 && params.offset === 0 && sortOrder === 'desc');

	return !isDirectQuery && !isLatestBlockFetch;
};

const indexNewBlocks = async blocks => {
	const blocksDB = await getBlocksIndex();
	if (blocks.data.length === 1) {
		const [block] = blocks.data;
		logger.info(`Indexing new block: ${block.id} at height ${block.height}`);

		const [blockInfo] = await blocksDB.find({ height: block.height, limit: 1 }, ['id', 'isFinal']);
		if (!blockInfo || (!blockInfo.isFinal && block.isFinal)) {
			// Index if doesn't exist, or update if it isn't set to final
			await indexBlocksQueue.add('indexBlocksQueue', { blocks: blocks.data });

			// Update block finality status
			const finalizedBlockHeight = getFinalizedHeight();
			const nonFinalBlocks = await blocksDB.find({ isFinal: false, limit: 1000 },
				Object.keys(blocksIndexSchema.schema));
			await updateBlockIndexQueue.add('updateBlockIndexQueue', {
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

const getBlocks = async params => {
	const blocksDB = await getBlocksIndex();
	const blocks = {
		data: [],
		meta: {},
	};

	if (params.blockId) {
		const { blockId, ...remParams } = params;
		params = remParams;
		params.id = blockId;
	}

	let accountInfo;

	if (params.address) {
		const { address, ...remParams } = params;
		params = remParams;
		accountInfo = await getIndexedAccountInfo({ address, limit: 1 }, ['publicKey']);
	}
	if (params.username) {
		const { username, ...remParams } = params;
		params = remParams;
		accountInfo = await getIndexedAccountInfo({ username, limit: 1 }, ['publicKey']);
	}

	if (accountInfo && accountInfo.publicKey) {
		params.generatorPublicKey = accountInfo.publicKey;
	}

	if (params.height && typeof params.height === 'string' && params.height.includes(':')) {
		const { height, ...remParams } = params;
		params = remParams;
		const [from, to] = height.split(':');
		if (from && to && from > to) throw new ValidationException('From height cannot be greater than to height');
		if (!params.propBetweens) params.propBetweens = [];
		params.propBetweens.push({
			property: 'height',
			from,
			to,
		});
	}

	if (params.timestamp && params.timestamp.includes(':')) {
		const { timestamp, ...remParams } = params;
		params = remParams;
		const [from, to] = timestamp.split(':');
		if (from && to && from > to) throw new ValidationException('From timestamp cannot be greater than to timestamp');
		if (!params.propBetweens) params.propBetweens = [];
		params.propBetweens.push({
			property: 'timestamp',
			from,
			to,
		});
	}

	const total = await blocksDB.count(params);
	if (isQueryFromIndex(params)) {
		const resultSet = await blocksDB.find(params, ['id']);
		params.ids = resultSet.map(row => row.id);
	}

	try {
		if (params.ids) {
			blocks.data = await getBlocksByIDs(params.ids);
		} else if (params.id) {
			blocks.data = await getBlockByID(params.id);
			if (Array.isArray(blocks.data) && !blocks.data.length) throw new NotFoundException(`Block ID ${params.id} not found.`);
			if ('offset' in params && params.limit) blocks.data = blocks.data.slice(params.offset, params.offset + params.limit);
		} else if (params.height) {
			blocks.data = await getBlockByHeight(params.height);
			if (Array.isArray(blocks.data) && !blocks.data.length) throw new NotFoundException(`Height ${params.height} not found.`);
			if ('offset' in params && params.limit) blocks.data = blocks.data.slice(params.offset, params.offset + params.limit);
		} else if (params.heightBetween) {
			const { from, to } = params.heightBetween;
			blocks.data = await getBlocksByHeightBetween(from, to);
			if (params.sort) {
				const [sortProp, sortOrder] = params.sort.split(':');
				blocks.data = blocks.data.sort(
					(a, b) => sortOrder === 'asc' ? a[sortProp] - b[sortProp] : b[sortProp] - a[sortProp],
				);
			}
		} else {
			blocks.data = await getLastBlock();
		}
	} catch (err) {
		// Block does not exist
		if (err.message.includes('does not exist')) {
			let errMessage;
			if (err.message.includes(':id')) errMessage = `Block ${params.id} does not exist`;
			if (err.message.includes(':height')) errMessage = `Block at height ${params.height} does not exist`;
			throw new NotFoundException(errMessage);
		}
		throw err;
	}

	blocks.meta = {
		count: blocks.data.length,
		offset: params.offset,
		total,
	};

	return blocks;
};

const deleteBlock = async (block) => {
	await deleteIndexedBlocksQueue.add('deleteIndexedBlocksQueue', { blocks: [block] });
	return block;
};

const cacheLegacyAccountInfo = async () => {
	// Cache the legacy account reclaim balance information
	const [genesisBlock] = await getBlockByHeight(genesisHeight, false);
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

const indexGenesisAccounts = async () => {
	let numAccountsIndexed;
	const BATCH_SIZE = 10000;
	try {
		const accountsDB = await getAccountsIndex();
		numAccountsIndexed = await accountsDB.count();

		if (!isGenesisAccountsIndexingInProgress) {
			isGenesisAccountsIndexingInProgress = true;
			genesisAccountIndexingBatchNum++;

			const [genesisBlock] = await getBlockByHeight(genesisHeight, false);
			if (!genesisAccountsToIndex) {
				genesisAccountsToIndex = genesisBlock.asset.accounts
					.filter(account => account.address.length === 40);
				logger.info(`${genesisAccountsToIndex.length} registered accounts found in the genesis block`);
			}

			// If the cache doesn't contain information, it'll be updated later on successful completion
			const indexedTillBatch = await genesisAccountsCache.get('indexedTillBatch');
			if (
				indexedTillBatch !== undefined
				&& numAccountsIndexed < ((indexedTillBatch + 1) * BATCH_SIZE)
			) {
				// Resume indexing starting from the batch that was last indexed
				genesisAccountIndexingBatchNum = indexedTillBatch;
				logger.info(`Genesis accounts already indexed until batch: ${genesisAccountIndexingBatchNum - 1}, will continue from batch ${genesisAccountIndexingBatchNum}`);
			} else {
				// Calculate number of batches that already have been indexed and continue
				const prevGenesisAccountIndexingBatchNum = genesisAccountIndexingBatchNum;
				genesisAccountIndexingBatchNum = Math.floor(numAccountsIndexed / BATCH_SIZE);
				if (indexedTillBatch === undefined || prevGenesisAccountIndexingBatchNum === 0) {
					logger.info(`Genesis accounts already indexed until batch: ${genesisAccountIndexingBatchNum - 1}, will continue from batch ${genesisAccountIndexingBatchNum}`);
				}
			}

			const batchNum = genesisAccountIndexingBatchNum; // Use shorter alias
			const genesisAccountAddressesToIndex = genesisAccountsToIndex
				.slice(batchNum * BATCH_SIZE, (batchNum + 1) * BATCH_SIZE)
				.map(account => account.address);

			logger.debug(`numAccountsIndexed: ${numAccountsIndexed}, numGenesisAccounts: ${genesisAccountsToIndex.length}`);

			if (numAccountsIndexed >= genesisAccountsToIndex.length) {
				logger.info(`Genesis block accounts already indexed from height ${genesisHeight}`);
				Signals.get('newBlock').remove(indexGenesisAccounts);
			} else {
				if (batchNum === 0) {
					logger.info(`Starting indexing of genesis block accounts from height ${genesisHeight} in batches of ${BATCH_SIZE}`);

					// Index the genesis block accounts
					const initDelegateAddresses = genesisBlock.asset.initDelegates;
					await indexAccountsbyAddress(initDelegateAddresses, true);
				}

				logger.info(`Indexing genesis account batch: ${batchNum}, ${Math.ceil(genesisAccountsToIndex.length / BATCH_SIZE) - batchNum - 1} to go`);

				const PAGE_SIZE = 1000;
				const NUM_PAGES = Math.ceil(genesisAccountAddressesToIndex.length / PAGE_SIZE);
				for (let i = 0; i < NUM_PAGES; i++) {
					// eslint-disable-next-line no-await-in-loop
					await indexAccountsbyAddress(
						genesisAccountAddressesToIndex.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE),
						true,
					);
				}

				if (genesisAccountAddressesToIndex.length < BATCH_SIZE) {
					// Stop retrying genesis account indexing on successful completion
					Signals.get('newBlock').remove(indexGenesisAccounts);
					logger.info('Finished indexing the genesis block accounts');

					// Reset global variables and free memory
					genesisAccountIndexingBatchNum = -1;
					genesisAccountsToIndex = undefined;
				}
			}

			// On success, update the cache with the batch number
			await genesisAccountsCache.set('indexedTillBatch', genesisAccountIndexingBatchNum);
		}
	} catch (err) {
		logger.warn(`Unable to index Genesis block accounts batch ${genesisAccountIndexingBatchNum}, will retry again: ${err}`);
		genesisAccountIndexingBatchNum--;
		await genesisAccountsCache.set('indexedTillBatch', genesisAccountIndexingBatchNum);
	} finally {
		if (numAccountsIndexed >= BATCH_SIZE * (genesisAccountIndexingBatchNum + 1)) {
			isGenesisAccountsIndexingInProgress = false;
		}
	}
};

const indexAllDelegateAccounts = async () => {
	const allDelegatesInfo = await requestApi(coreApi.getAllDelegates);
	const allDelegateAddresses = allDelegatesInfo.data.map(({ address }) => address);
	const PAGE_SIZE = 1000;
	for (let i = 0; i < Math.ceil(allDelegateAddresses.length / PAGE_SIZE); i++) {
		// eslint-disable-next-line no-await-in-loop
		await indexAccountsbyAddress(allDelegateAddresses.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE));
	}
	logger.info(`Indexed ${allDelegateAddresses.length} delegate accounts`);
};

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
		logger.info(`Attempting to cache blocks ${batchFromHeight}-${batchToHeight}`);

		let blocks;
		do {
			blocks = await getBlocksByHeightBetween(batchFromHeight, batchToHeight);
		} while (!(blocks.length && blocks.every(block => !!block && block.height >= 0)));

		await indexBlocksQueue.add('indexBlocksQueue', { blocks });
		/* eslint-enable no-await-in-loop */
	}
	logger.info(`Finished building block index (${from}-${to})`);
};

const indexMissingBlocks = async (startHeight, endHeight) => {
	try {
		// startHeight can never be lower than genesisHeight
		// and, do not search the index below the indexVerifiedHeight
		// endHeight can not be lower than startHeight or indexVerifiedHeight
		startHeight = Math.max(startHeight, genesisHeight, indexVerifiedHeight);
		endHeight = Math.max(startHeight, endHeight, indexVerifiedHeight);

		const PAGE_SIZE = 10000;
		const numOfPages = Math.ceil((endHeight - startHeight) / PAGE_SIZE);
		for (let pageNum = 0; pageNum < numOfPages; pageNum++) {
			/* eslint-disable no-await-in-loop */
			const toHeight = endHeight - (PAGE_SIZE * pageNum);
			const fromHeight = (toHeight - PAGE_SIZE) > startHeight
				? (toHeight - PAGE_SIZE) : startHeight;

			logger.info(`Checking for missing blocks between height ${fromHeight} - ${toHeight}`);

			const blocksDB = await getBlocksIndex();
			const propBetweens = [{
				property: 'height',
				from: fromHeight,
				to: toHeight,
			}];
			const indexedBlockCount = await blocksDB.count({ propBetweens });
			if (indexedBlockCount < toHeight) {
				const missingBlocksQueryStatement = `
					SELECT
						(SELECT COALESCE(MAX(b0.height)+1, ${genesisHeight}) FROM blocks b0 WHERE b0.height < b1.height) AS 'from',
						(b1.height - 1) AS 'to'
					FROM blocks b1
					WHERE b1.height BETWEEN ${fromHeight} AND ${toHeight}
						AND b1.height != ${genesisHeight}
						AND NOT EXISTS (SELECT 1 FROM blocks b2 WHERE b2.height = b1.height - 1)
				`;

				logger.debug('propBetweens', util.inspect(propBetweens));
				const missingBlocksRanges = await blocksDB.rawQuery(missingBlocksQueryStatement);
				logger.debug('missingBlocksRanges', util.inspect(missingBlocksRanges));

				if (missingBlocksRanges.length === 0) {
					// Update 'indexVerifiedHeight' when no missing blocks are found
					indexVerifiedHeight = Math.max(indexVerifiedHeight, toHeight);
				} else {
					for (let i = 0; i < missingBlocksRanges.length; i++) {
						const { from, to } = missingBlocksRanges[i];

						logger.info(`Attempting to cache missing blocks ${from}-${to}`);
						await buildIndex(from, to);
					}
				}
			}
			/* eslint-enable no-await-in-loop */
		}
	} catch (err) {
		logger.warn(`Missed blocks indexing failed due to: ${err.message}`);
		await indexMissingBlocks(startHeight, endHeight);
	}
};

const indexPastBlocks = async () => {
	logger.info('Building the blocks index');
	const blocksDB = await getBlocksIndex();

	if (config.indexNumOfBlocks === 0) setIsSyncFullBlockchain(true);

	// Lowest and highest block heights expected to be indexed
	const blockIndexHigherRange = (await requestApi(coreApi.getNetworkStatus)).data.height;
	const blockIndexLowerRange = config.indexNumOfBlocks > 0
		? blockIndexHigherRange - config.indexNumOfBlocks : genesisHeight;

	// Store the value for the missing blocks job
	setIndexStartHeight(blockIndexLowerRange);

	// Highest finalized block available within the index
	// If index empty, default lastIndexedHeight (alias for height) to blockIndexLowerRange
	const [{ height: lastIndexedHeight = blockIndexLowerRange } = {}] = await blocksDB.find({
		sort: 'height:desc',
		limit: 1,
		isFinal: true,
	}, ['height']);
	const highestIndexedHeight = lastIndexedHeight > blockIndexLowerRange
		? lastIndexedHeight : blockIndexLowerRange;

	// Start building the block index
	await buildIndex(highestIndexedHeight, blockIndexHigherRange).catch(err => {
		logger.warn(`Indexing failed due to: ${err.message}`);
	});
	await indexMissingBlocks(blockIndexLowerRange, blockIndexHigherRange);
	logger.info('Finished building the blocks index');
};

const checkIndexReadiness = async () => {
	logger.debug('============== Checking blocks index ready status ==============');
	if (!getIndexReadyStatus()) {
		try {
			const blocksDB = await getBlocksIndex();
			const networkStatus = await requestApi(coreApi.getNetworkStatus);
			const currentChainHeight = networkStatus.data.height;
			const numBlocksIndexed = await blocksDB.count();
			const [lastIndexedBlock] = await blocksDB.find({ sort: 'height:desc', limit: 1 }, ['height']);

			logger.debug(
				`\nnumBlocksIndexed: ${numBlocksIndexed}`,
				`\nlastIndexedBlock: ${lastIndexedBlock.height}`,
				`\ncurrentChainHeight: ${currentChainHeight}`,
			);
			if (numBlocksIndexed >= currentChainHeight - genesisHeight
				&& lastIndexedBlock.height >= currentChainHeight - 1) {
				setIndexReadyStatus(true);
				logger.info('Blocks index is now ready');
				logger.debug(`============== 'blockIndexReady' signal: ${Signals.get('blockIndexReady')} ==============`);
				Signals.get('blockIndexReady').dispatch(true);
			} else {
				logger.debug('Blocks index is not yet ready');
			}
		} catch (err) {
			logger.warn(`Error while checking index readiness: ${err.message}`);
		}
	}
	return getIndexReadyStatus();
};

const init = async () => {
	// Index every new incoming block
	const indexNewBlocksListener = async (data) => { await indexNewBlocks(data); };
	Signals.get('newBlock').add(indexNewBlocksListener);

	// Check state of index and perform update
	try {
		// Set the genesis height
		setGenesisHeight(await coreApi.getGenesisHeight());
		indexVerifiedHeight = getGenesisHeight() - 1;

		// First download the genesis block, if applicable
		await getBlocks({ height: genesisHeight });

		// Start the indexing process
		await indexAllDelegateAccounts();
		await cacheLegacyAccountInfo();
		await indexPastBlocks();
		await indexGenesisAccounts();
	} catch (err) {
		logger.warn(`Unable to update block index:\n${err.stack}`);
	}

	// Check and update index readiness status
	Signals.get('newBlock').add(checkIndexReadiness);

	const indexGenesisAccountsListener = async ({ data: [newBlock] }) => {
		if (newBlock.height % 10 === 0) await indexGenesisAccounts();
	};
	Signals.get('newBlock').add(indexGenesisAccountsListener);
};

module.exports = {
	init,
	getBlocks,
	deleteBlock,
	getGenesisHeight,
	getIndexStartHeight,
	indexMissingBlocks,
	updateFinalizedHeight,
	getFinalizedHeight,
	normalizeBlocks,
};
