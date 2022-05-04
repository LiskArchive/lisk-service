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
	CacheRedis,
	Exceptions: { NotFoundException },
} = require('lisk-service-framework');

const { getFinalizedHeight } = require('../../constants');
const { getTableInstance } = require('../../database/mysql');
const blocksIndexSchema = require('../../database/schema/blocks');

const { getIndexedAccountInfo, getBase32AddressFromHex } = require('../../utils/accountUtils');
const { requestConnector } = require('../../utils/request');
const { normalizeRangeParam } = require('../../utils/paramUtils');
const { parseToJSONCompatObj, parseInputBySchema } = require('../../utils/parser');
const { getTxnMinFee } = require('../../utils/transactionsUtils');

const getBlocksIndex = () => getTableInstance('blocks', blocksIndexSchema);

const config = require('../../../config');

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
			block.generatorAddress = await getBase32AddressFromHex(block.generatorAddress);
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

module.exports = {
	getBlocks,
	getFinalizedHeight,
	normalizeBlocks,
	getLastBlock,
	getBlockByHeight,
	getBlockByID,
};
