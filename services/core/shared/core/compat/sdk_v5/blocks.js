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

const getBlocksIndex = () => mysqlIndex('blocks', blocksIndexSchema);

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
	blocks.forEach(async block => {
		if (block.generatorPublicKey) {
			const [blockInfo] = await blocksDB.find({ id: block.id, limit: 1 }, ['id']);
			generatorPkInfoArray.push({
				publicKey: block.generatorPublicKey,
				reward: block.reward,
				isForger: true,
				isBlockIndexed: !!blockInfo,
			});
		}
	});
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

const normalizeBlocks = async (blocks, includeGenesisAccounts = false) => {
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

			if (includeGenesisAccounts !== true) {
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

const getBlockByHeight = async (height, includeGenesisAccounts = false) => {
	const response = await requestApi(coreApi.getBlockByHeight, height);
	return normalizeBlocks(response.data, includeGenesisAccounts);
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
	const [genesisBlock] = await getBlockByHeight(genesisHeight, true);
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
	const [genesisBlock] = await getBlockByHeight(genesisHeight, true);

	const genesisAccountsToIndex = genesisBlock.asset.accounts;
	const genesisAccountPageCached = 'genesisAccountPageCached';

	logger.info(`${genesisAccountsToIndex.length} registered accounts found in the genesis block`);

	const lastCachedPage = await genesisAccountsCache.get(genesisAccountPageCached) || 0;

	const PAGE_SIZE = 1000;
	const NUM_PAGES = Math.ceil(genesisAccountsToIndex.length / PAGE_SIZE);
	for (let pageNum = 0; pageNum < NUM_PAGES; pageNum++) {
		const currentPage = pageNum * PAGE_SIZE;
		const nextPage = (pageNum + 1) * PAGE_SIZE;
		const percentage = Math.round(((nextPage - 1) / genesisAccountsToIndex.length) * 1000);

		if (pageNum >= lastCachedPage) {
			const slicedAccounts = genesisAccountsToIndex.slice(currentPage, nextPage);
			const genesisAccountAddressesToIndex = slicedAccounts
				.filter(account => account.address.length === 40)
				.map(account => account.address);
	
			logger.info(`Scheduling retrieval of genesis accounts batch ${pageNum}/${NUM_PAGES} (${(percentage / 10).toFixed(1)}%)`);
	
			// eslint-disable-next-line no-await-in-loop
			await indexAccountsbyAddress(genesisAccountAddressesToIndex, true);
			await genesisAccountsCache.set(genesisAccountPageCached, pageNum);
		} else {
			logger.info(`Skipping retrieval of genesis accounts batch ${pageNum}/${NUM_PAGES} (${(percentage / 10).toFixed(1)}%)`);
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
		logger.info('Attepmting to update genesis account index update (one-time operation)');
		await performGenesisAccountsIndexing();
		await genesisAccountsCache.set('isGenesisAccountIndexingScheduled', true);
		await genesisAccountsCache.set('genesisAccountPageCached', 0);
	} catch (err) {
		logger.error('Critical error: Unable to index Genesis block accounts batch. Will retry after the restart');
		logger.error(err.message);
		process.exit(1);
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
		const percentage = Math.round(((pageNum + 1) / numOfPages) * 1000);
		logger.info(`Scheduling retrieval of blocks ${batchFromHeight}-${batchToHeight} (${(percentage / 10).toFixed(1)}%)`);

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

			logger.info([
				`numBlocksIndexed: ${numBlocksIndexed}`,
				`lastIndexedBlock: ${lastIndexedBlock.height}`,
				`currentChainHeight: ${currentChainHeight}`,
			].join(', '));
			if (numBlocksIndexed >= currentChainHeight - genesisHeight
				&& lastIndexedBlock.height >= currentChainHeight - 1) {
				setIndexReadyStatus(true);
				logger.info('The blockchain index is complete');
				logger.debug(`============== 'blockIndexReady' signal: ${Signals.get('blockIndexReady')} ==============`);
				Signals.get('blockIndexReady').dispatch(true);
			} else {
				logger.info('The blockchain indexing in progress');
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
		const gHeight = await coreApi.getGenesisHeight();
		setGenesisHeight(gHeight);
		indexVerifiedHeight = getGenesisHeight() - 1;

		logger.info(`Genesis height is set to ${gHeight}`);

		// First download the genesis block, if applicable
		await getBlockByHeight(gHeight);

		// Start the indexing process
		await indexAllDelegateAccounts();
		await cacheLegacyAccountInfo();
		await indexGenesisAccounts();
		await indexPastBlocks();
	} catch (err) {
		logger.warn(`Unable to update block index:\n${err.stack}`);
	}

	// Check and update index readiness status
	Signals.get('newBlock').add(checkIndexReadiness);
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
