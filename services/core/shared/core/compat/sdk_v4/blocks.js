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
const { CacheRedis, Logger } = require('lisk-service-framework');

const coreApi = require('./coreApi');
const signals = require('../../../signals');

const config = require('../../../../config');

const {
	getUnixTime,
	getBlockchainTime,
	validateTimestamp,
} = require('../common');

const redis = require('../../../redis');

const logger = Logger();

const bIdCache = CacheRedis('blockIdToTimestamp', config.endpoints.redis);

const MAX_BLOCKS_LIMIT_PP = 100;

let currentHeight = 0;

let heightFinalized;

const setFinalizedHeight = (height) => {
	heightFinalized = height;
};

const updateFinalizedHeight = async () => {
	const result = await coreApi.getNetworkStatus();
	setFinalizedHeight(result.data.chainMaxHeightFinalized);
	return result;
};

const getFinalizedHeight = () => heightFinalized;

const indexBlock = async block => {
	const timestampDb = await redis('timestampDb', ['timestamp']);
	const unixTimestampDb = await redis('unixTimestampDb', ['timestamp']);

	bIdCache.set(block.id, block.timestamp);

	bIdCache.set('lowestIndexedHeight', block.height);
	bIdCache.set('topIndexedHeight', block.height);

	timestampDb.writeRange(block.timestamp, block.id);
	unixTimestampDb.writeRange(block.unixTimestamp, {
		id: block.id,
		numberOfTransactions: block.numberOfTransactions,
	});
};

const getBlocks = async (params) => {
	const blocks = {
		data: [],
		meta: {},
	};

	await Promise.all(
		['fromTimestamp', 'toTimestamp'].map(async (timestamp) => {
			if (await validateTimestamp(params[timestamp])) {
				params[timestamp] = await getBlockchainTime(params[timestamp]);
			}
			return Promise.resolve();
		}),
	);

	const response = await coreApi.getBlocks(params);
	if (response.data) blocks.data = response.data;
	if (response.meta) blocks.meta = response.meta;

	blocks.data.forEach((block) => {
		if (block.height > currentHeight) currentHeight = block.height;
	});

	await Promise.all(
		blocks.data.map(async (o) => Object.assign(o, {
			unixTimestamp: await getUnixTime(o.timestamp),
			isImmutable: currentHeight - o.height >= getFinalizedHeight(),
		}),
		),
	);

	blocks.data.forEach(block => {
		if (block.numberOfTransactions > 0) {
			indexBlock(block);
			signals.get('indexTransactions').dispatch(block.id);
		}
	});

	return blocks;
};

const buildIndex = async (from, to) => {
	logger.info('Building index of blocks');

	if (from >= to) {
		logger.warn(`Invalid interval of blocks to index: ${from} -> ${to}`);
		return;
	}

	const numOfPages = Math.ceil((to + 1) / MAX_BLOCKS_LIMIT_PP - from / MAX_BLOCKS_LIMIT_PP);

	for (let pageNum = 0; pageNum < numOfPages; pageNum++) {
		const offset = from + (MAX_BLOCKS_LIMIT_PP * pageNum);
		logger.info(`Attempting to cache blocks ${offset}-${offset + MAX_BLOCKS_LIMIT_PP}`);
		// eslint-disable-next-line no-await-in-loop
		const blocks = await getBlocks({
			limit: MAX_BLOCKS_LIMIT_PP,
			offset: offset - 1,
			sort: 'height:asc',
		});
		blocks.data.forEach(async block => {
			if (!(await bIdCache.get(block.id))) {
				if (block.numberOfTransactions > 0) {
					indexBlock(block);
					signals.get('indexTransactions').dispatch(block.id);
				}
			}
		});
		const topHeightFromBatch = (blocks.data.pop()).height;
		// eslint-disable-next-line no-await-in-loop
		await bIdCache.set('lastIndexedHeight', topHeightFromBatch);
	}
	logger.info(`Finished building block index (${from}-${to})`);
};

const init = async () => {
	try {
		currentHeight = (await coreApi.getNetworkStatus()).data.height;

		let blockIndexLowerRange = currentHeight - config.indexNumOfBlocks;
		const lastNumOfBlocks = await bIdCache.get('lastNumOfBlocks');

		if (Number(lastNumOfBlocks) === Number(config.indexNumOfBlocks)) {
			// Everything seems allright, continue at height where stopped last time
			blockIndexLowerRange = await bIdCache.get('lastIndexedHeight');
		} else {
			logger.info('Configuration changed since the last time, re-index eveything');
			await bIdCache.set('lastNumOfBlocks', config.indexNumOfBlocks);
			await bIdCache.set('lastIndexedHeight', blockIndexLowerRange);
		}

		if (Number.isInteger(blockIndexLowerRange)) {
			await buildIndex(blockIndexLowerRange, currentHeight);
		} else {
			await buildIndex(0, currentHeight);
		}
	} catch (err) {
		logger.warn('Unable to build block cache');
		logger.warn(err.message);
	}
};

init();

module.exports = {
	getBlocks,
	updateFinalizedHeight,
	getFinalizedHeight,
};
