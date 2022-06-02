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

const { getFinalizedHeight } = require('../../constants');
const blocksIndexSchema = require('../../database/schema/blocks');

const { getBase32AddressFromHex } = require('../../utils/accountUtils');
const { requestConnector } = require('../../utils/request');
const { normalizeRangeParam } = require('../../utils/paramUtils');
const { parseToJSONCompatObj, parseInputBySchema } = require('../../utils/parser');
const { getTxnMinFee } = require('../../utils/transactionsUtils');

const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getBlocksIndex = () => getTableInstance('blocks', blocksIndexSchema, MYSQL_ENDPOINT);

const latestBlockCache = CacheRedis('latestBlock', config.endpoints.cache);

let latestBlock;

const normalizeBlocks = async (blocks) => {
	const normalizedBlocks = await BluebirdPromise.map(
		blocks.map(block => ({
			...block.header,
			transactions: block.transactions,
			assets: block.assets,
		})),
		async block => {
			if (block.generatorAddress) {
				block.generatorAddress = await getBase32AddressFromHex(block.generatorAddress);
			}
			block.isFinal = block.height <= (await getFinalizedHeight());
			block.numberOfTransactions = block.transactions.length;

			block.size = 0;
			// TODO: get reward value from block event
			block.totalForged = BigInt(block.reward || '0');
			block.totalBurnt = BigInt('0');
			block.totalFee = BigInt('0');

			await BluebirdPromise.map(
				block.transactions,
				async (txn) => {
					const schema = await requestConnector('getSchema');
					const { schema: paramsSchema } = schema.commands
						.find(s => s.moduleID === txn.moduleID && s.commandID === txn.commandID);
					const parsedTxAsset = parseInputBySchema(txn.params, paramsSchema);
					const parsedTx = parseInputBySchema(txn, schema.transaction);
					txn = { ...parsedTx, params: parsedTxAsset };
					txn.minFee = await getTxnMinFee(txn);
					block.size += txn.size;
					block.totalForged += BigInt(txn.fee);
					block.totalBurnt += BigInt(txn.minFee);
					block.totalFee += BigInt(txn.fee) - BigInt(txn.minFee);
				},
				{ concurrency: 1 },
			);

			return parseToJSONCompatObj(block);
		},
		{ concurrency: blocks.length },
	);

	return normalizedBlocks;
};

const getBlockByHeight = async (height) => {
	const response = await requestConnector('getBlockByHeight', { height });
	return normalizeBlocks([response]);
};

const getBlockByID = async id => {
	const response = await requestConnector('getBlockByID', { id });
	return normalizeBlocks([response]);
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
	[latestBlock] = await normalizeBlocks([response]);
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
			if (Array.isArray(params.ids) && !params.ids.length) throw new NotFoundException('Blocks not found.');
			blocks.data = await getBlocksByIDs(params.ids);
		} else if (params.id) {
			blocks.data = await getBlockByID(params.id);
			if (Array.isArray(blocks.data) && !blocks.data.length) throw new NotFoundException(`Block ID ${params.id} not found.`);
			if ('offset' in params && params.limit) blocks.data = blocks.data.slice(params.offset, params.offset + params.limit);
		} else if (params.height) {
			blocks.data = await getBlockByHeight(Number(params.height));
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

const filterAssets = (moduleID, block) => {
	const filteredAssets = moduleID
		? block.assets
			.filter(asset => Number(asset.moduleID) === Number(moduleID))
		: block.assets;
	return filteredAssets;
};

const getBlocksAssets = async (params) => {
	if (params.blockID) logger.debug(`Retrieving block assets for the block with ID ${params.blockID} from Lisk Core`);
	else if (params.height) logger.debug(`Retrieving block assets for the block at height: ${params.height} from Lisk Core`);
	else logger.debug(`Retrieving block assets with custom search: ${util.inspect(params)} from Lisk Core`);

	const blocksDB = await getBlocksIndex();
	const blockAssets = {
		data: [],
		meta: {},
	};
	let moduleIdFromParam;

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
		moduleIdFromParam = moduleID;
		params = remParams;
		params.whereJsonSupersetOf = { property: 'assetModuleIDs', values: moduleID };
	}

	const total = await blocksDB.count(params);
	const blocksFromDB = await blocksDB.find(params, ['id']);

	blockAssets.data = await BluebirdPromise.map(
		blocksFromDB,
		async (blockFromDB) => {
			const [blockFromCore] = await getBlockByID(blockFromDB.id);
			return {
				block: {
					id: blockFromCore.id,
					height: blockFromCore.height,
					timestamp: blockFromCore.timestamp,
				},
				assets: filterAssets(moduleIdFromParam, blockFromCore),
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
