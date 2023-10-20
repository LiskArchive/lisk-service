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
const util = require('util');
const BluebirdPromise = require('bluebird');

const {
	CacheRedis,
	Logger,
	DB: { MySQL: { getTableInstance } },
} = require('lisk-service-framework');

const logger = Logger();

const { getEventsByHeight } = require('./events');
const { getFinalizedHeight, MODULE, EVENT } = require('../../constants');
const blocksTableSchema = require('../../database/schema/blocks');

const { getIndexedAccountInfo } = require('../utils/account');
const { requestConnector } = require('../../utils/request');
const { normalizeRangeParam } = require('../../utils/param');
const { parseToJSONCompatObj } = require('../../utils/parser');
const { normalizeTransaction } = require('../../utils/transactions');
const { getNameByAddress } = require('../../utils/validator');

const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysqlReplica;

const getBlocksTable = () => getTableInstance(blocksTableSchema, MYSQL_ENDPOINT);

const latestBlockCache = CacheRedis('latestBlock', config.endpoints.cache);

let latestBlock;

const normalizeBlock = async (originalBlock) => {
	try {
		const blocksTable = await getBlocksTable();

		const block = {
			...originalBlock.header,
			transactions: originalBlock.transactions,
			assets: originalBlock.assets,
		};

		if (block.generatorAddress) {
			const generatorInfo = await getIndexedAccountInfo(
				{ address: block.generatorAddress, limit: 1 },
				['publicKey', 'name'],
			);

			block.generator = {
				address: block.generatorAddress,
				publicKey: generatorInfo ? generatorInfo.publicKey : null,
				name: generatorInfo && generatorInfo.name
					? generatorInfo.name
					: await getNameByAddress(block.generatorAddress),
			};
		}

		block.isFinal = block.height <= (await getFinalizedHeight());
		block.numberOfTransactions = block.transactions.length;
		block.numberOfAssets = block.assets.length;

		const { numberOfEvents, reward } = await (async () => {
			const [dbResponse] = await blocksTable.find(
				{ height: block.height, limit: 1 },
				['numberOfEvents', 'reward'],
			);

			if (dbResponse) {
				return {
					numberOfEvents: dbResponse.numberOfEvents,
					reward: dbResponse.reward,
				};
			}

			const events = await getEventsByHeight(block.height);
			const blockRewardEvent = events.find(
				e => [MODULE.REWARD, MODULE.DYNAMIC_REWARD].includes(e.module)
					&& e.name === EVENT.REWARD_MINTED,
			);

			return {
				numberOfEvents: events.length,
				reward: blockRewardEvent ? blockRewardEvent.data.amount : null,
			};
		})();

		block.numberOfEvents = numberOfEvents;
		block.size = 0;
		block.reward = reward;
		block.totalForged = BigInt(reward || '0');
		block.totalBurnt = BigInt('0');
		block.networkFee = BigInt('0');

		block.transactions = await BluebirdPromise.map(
			block.transactions,
			async (txn) => {
				txn = await normalizeTransaction(txn);

				block.size += txn.size;
				block.totalForged += BigInt(txn.fee);
				block.totalBurnt += BigInt(txn.minFee);
				block.networkFee += BigInt(txn.fee) - BigInt(txn.minFee);
				return txn;
			},
			{ concurrency: 1 },
		);

		return parseToJSONCompatObj(block);
	} catch (error) {
		logger.error(`Error occurred when normalizing block at height ${originalBlock.header.height}, id: ${originalBlock.header.id}:\n${error.stack}`);
		throw error;
	}
};

const normalizeBlocks = async (blocks) => {
	const normalizedBlocks = await BluebirdPromise.map(
		blocks,
		async block => normalizeBlock(block),
		{ concurrency: blocks.length },
	);

	return normalizedBlocks;
};

const getBlockByHeight = async (height) => {
	const response = await requestConnector('getBlockByHeight', { height });
	return normalizeBlock(response);
};

const getBlockByID = async id => {
	const response = await requestConnector('getBlockByID', { id });
	return normalizeBlock(response);
};

const getBlocksByIDs = async ids => {
	const response = await requestConnector('getBlocksByIDs', { ids });
	return normalizeBlocks(response);
};

const getLastBlock = async () => {
	const response = await requestConnector('getLastBlock');
	latestBlock = await normalizeBlock(response);
	if (latestBlock && latestBlock.id) {
		await latestBlockCache.set('latestBlock', JSON.stringify(latestBlock));
	}
	return latestBlock;
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

const getBlocks = async params => {
	const blocksTable = await getBlocksTable();
	const blocks = {
		data: [],
		meta: {},
	};

	if (params.blockID) {
		const { blockID, ...remParams } = params;
		params = remParams;
		params.id = blockID;
	}

	if (params.height && typeof params.height === 'string' && params.height.includes(':')) {
		params = normalizeRangeParam(params, 'height');
	}

	if (params.timestamp && params.timestamp.includes(':')) {
		params = normalizeRangeParam(params, 'timestamp');
	}

	const total = await blocksTable.count(params);
	if (isQueryFromIndex(params)) {
		const resultSet = await blocksTable.find(params, ['id']);
		params.ids = resultSet.map(row => row.id);
	}

	try {
		if (params.ids) {
			if (Array.isArray(params.ids) && !params.ids.length) return blocks;
			blocks.data = await getBlocksByIDs(params.ids);
		} else if (params.id) {
			blocks.data.push(await getBlockByID(params.id));
			if ('offset' in params && params.limit) blocks.data = blocks.data.slice(params.offset, params.offset + params.limit);
		} else if (params.height) {
			blocks.data.push(await getBlockByHeight(Number(params.height)));
			if ('offset' in params && params.limit) blocks.data = blocks.data.slice(params.offset, params.offset + params.limit);
		} else {
			blocks.data.push(await getLastBlock());
		}
	} catch (err) {
		if (!err.message.includes('does not exist')) throw err;
	}

	blocks.meta = {
		count: blocks.data.length,
		offset: params.offset,
		total,
	};

	return blocks;
};

const filterBlockAssets = (modules, block) => {
	const filteredBlockAssets = modules.length
		? block.assets.filter(asset => modules.includes(String(asset.module)))
		: block.assets;
	return filteredBlockAssets;
};

const getBlocksAssets = async (params) => {
	const blocksTable = await getBlocksTable();
	const blockAssets = {
		data: [],
		meta: {},
	};

	const modules = [];

	if (params.blockID) {
		const { blockID, ...remParams } = params;
		params = remParams;
		params.id = blockID;
	}

	if (params.height && typeof params.height === 'string' && params.height.includes(':')) {
		params = normalizeRangeParam(params, 'height');
	}

	if (params.timestamp && params.timestamp.includes(':')) {
		params = normalizeRangeParam(params, 'timestamp');
	}

	if (params.module) {
		const { module, ...remParams } = params;
		const moduleArr = String(module).split(',');
		modules.push(...moduleArr);
		params = remParams;
		params.whereJsonSupersetOf = { property: 'assetsModules', values: modules };
	}

	logger.debug(`Querying index to retrieve block IDs with params: ${util.inspect(params)}`);
	const total = await blocksTable.count(params);
	const blocksFromDB = await blocksTable.find(params, ['id']);

	logger.debug(`Requesting blockchain application for blocks with IDs: ${blocksFromDB.map(b => b.id).join(', ')}`);
	blockAssets.data = await BluebirdPromise.map(
		blocksFromDB,
		async (blockFromDB) => {
			const block = await getBlockByID(blockFromDB.id);

			return {
				block: {
					id: block.id,
					height: block.height,
					timestamp: block.timestamp,
				},
				assets: filterBlockAssets(modules, block),
			};
		},
		{ concurrency: blocksFromDB.length },
	);

	blockAssets.meta = {
		count: blockAssets.data.length,
		offset: params.offset,
		total,
	};

	return blockAssets;
};

module.exports = {
	getBlocks,
	getFinalizedHeight,
	normalizeBlocks,
	getLastBlock,
	getBlockByHeight,
	getBlockByID,
	getBlocksAssets,
};
