/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const coreApi = require('./coreApi');
const {
	getBlockchainTime,
	validateTimestamp,
} = require('../common');

let finalizedHeight;

const setFinalizedHeight = (height) => finalizedHeight = height;

const updateFinalizedHeight = async () => {
	const result = await coreApi.getNetworkStatus();
	setFinalizedHeight(result.data.finalizedHeight);
	return result;
};

const getFinalizedHeight = () => finalizedHeight;

const normalizeBlock = block => {
	block.id = block.id.toString('hex');
	block.signature = block.signature.toString('hex');
	block.previousBlockID = block.previousBlockID.toString('hex');
	block.transactionRoot = block.transactionRoot.toString('hex');
	block.generatorPublicKey = block.generatorPublicKey.toString('hex');
	block.reward = Number(block.reward);
	block.asset.seedReveal = block.asset.seedReveal.toString('hex');

	return block;
};

const getBlocks = async params => {
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
	if (response.data) blocks.data = response.data.map(block => normalizeBlock(block.header));
	if (response.meta) blocks.meta = response.meta; // TODO: Build meta manually

	blocks.data.map(block => block.unixTimestamp = block.timestamp);

	return blocks;
};

module.exports = {
	getBlocks,
	updateFinalizedHeight,
	getFinalizedHeight,
};
