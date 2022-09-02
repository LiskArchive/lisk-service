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

const util = require('util');

const {
	CacheRedis,
	Logger,
	Exceptions: { NotFoundException },
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const logger = Logger();

// const { getEventsByHeight } = require('./events');
const { getFinalizedHeight } = require('../../constants');
const blocksIndexSchema = require('../../database/schema/blocks');

const { getLisk32AddressFromHex, getIndexedAccountInfo } = require('../../utils/accountUtils');
const { requestConnector } = require('../../utils/request');
const { normalizeRangeParam } = require('../../utils/paramUtils');
const { parseToJSONCompatObj } = require('../../utils/parser');
const { normalizeTransaction } = require('../../utils/transactionsUtils');

const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getBlocksIndex = () => getTableInstance('blocks', blocksIndexSchema, MYSQL_ENDPOINT);

const latestBlockCache = CacheRedis('latestBlock', config.endpoints.cache);

let latestBlock;

const normalizeBlock = async (originalblock) => {
	try {
		const blocksDB = await getBlocksIndex();

		const block = {
			...originalblock.header,
			transactions: originalblock.transactions,
			assets: originalblock.assets,
		};

		if (block.generatorAddress) {
			block.generatorAddress = await getLisk32AddressFromHex(block.generatorAddress);

			const generatorInfo = await getIndexedAccountInfo(
				{ address: block.generatorAddress, limit: 1 },
				['publicKey', 'name'],
			);

			block.generator = {
				address: block.generatorAddress,
				publicKey: generatorInfo ? generatorInfo.publicKey : null,
				name: generatorInfo ? generatorInfo.name : null,
			};
		}

		block.isFinal = block.height <= (await getFinalizedHeight());
		block.numberOfTransactions = block.transactions.length;
		block.numberOfAssets = block.assets.length;
		const [{ numberOfEvents, reward } = {}] = await blocksDB.find({ height: block.height }, ['numberOfEvents', 'reward']);
		block.numberOfEvents = numberOfEvents;

		block.size = 0;
		// TODO: get reward value from block event
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
		logger.error(`Error occured when normalizing block at height ${originalblock.header.height}, id: ${originalblock.header.id}:\n${error.stack}`);
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

const getBlocksByHeightBetween = async (from, to) => {
	const response = await requestConnector('getBlocksByHeightBetween', { from, to });
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
	const blocksDB = await getBlocksIndex();
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

	const total = await blocksDB.count(params);
	if (isQueryFromIndex(params)) {
		const resultSet = await blocksDB.find(params, ['id']);
		params.ids = resultSet.map(row => row.id);
	}

	try {
		if (params.ids) {
			if (Array.isArray(params.ids) && !params.ids.length) throw new NotFoundException(`Block with IDs: ${params.ids.join(', ')} not found.`);
			blocks.data = await getBlocksByIDs(params.ids);
		} else if (params.id) {
			blocks.data.push(await getBlockByID(params.id));
			if (Array.isArray(blocks.data) && !blocks.data.length) throw new NotFoundException(`Block ID ${params.id} not found.`);
			if ('offset' in params && params.limit) blocks.data = blocks.data.slice(params.offset, params.offset + params.limit);
		} else if (params.height) {
			blocks.data.push(await getBlockByHeight(Number(params.height)));
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
			blocks.data.push(await getLastBlock());
		}
	} catch (err) {
		// Block does not exist
		if (err.message.includes('does not exist')) {
			let errMessage;
			if ('id' in params && err.message.includes(params.id)) errMessage = `Block with ID ${params.id} does not exist`;
			if ('height' in params) errMessage = `Block at height ${params.height} does not exist (${err.message})`;
			throw new NotFoundException(errMessage || err.message);
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

const filterBlockAssets = (moduleIDs, block) => {
	const filteredBlockAssets = moduleIDs.length
		? block.assets.filter(asset => moduleIDs.includes(String(asset.moduleID)))
		: block.assets;
	return filteredBlockAssets;
};

const getBlocksAssets = async (params) => {
	const blocksDB = await getBlocksIndex();
	const blockAssets = {
		data: [],
		meta: {},
	};

	const moduleIDs = [];

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

	if (params.moduleID) {
		const { moduleID, ...remParams } = params;
		const moduleIDArr = String(moduleID).split(',');
		moduleIDs.push(...moduleIDArr);
		params = remParams;
		params.whereJsonSupersetOf = { property: 'assetsModuleIDs', values: moduleIDs };
	}

	logger.debug(`Querying index to retrieve block IDs with params: ${util.inspect(params)}`);
	const total = await blocksDB.count(params);
	const blocksFromDB = await blocksDB.find(params, ['id']);

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
				assets: filterBlockAssets(moduleIDs, block),
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
