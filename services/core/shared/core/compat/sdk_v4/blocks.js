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
const { CacheRedis } = require('lisk-service-framework');

const coreApi = require('./coreApi');

const config = require('../../../../config');

const {
	getUnixTime,
	getBlockchainTime,
	validateTimestamp,
} = require('../common');

// const timestampDb = require('../../../redis')('timestampDb', ['timestamp']);

const bIdCache = CacheRedis('blockIdToTimestamp', config.endpoints.redis);
// const bHeightCache = CacheRedis('blockHeightToTimestamp', config.endpoints.redis);

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
		if (block.numberOfTransactions > 0) { // block.isFinal === true && ??
			bIdCache.set(block.id, block.timestamp);
			// bHeightCache.set(block.height, block.timestamp); // block.unixTimestamp
			// timestampDb.write({
			// 	id: block.id,
			// 	timestamp: block.timestamp,
			// });
		}
	});

	return blocks;
};

module.exports = {
	getBlocks,
	updateFinalizedHeight,
	getFinalizedHeight,
};
