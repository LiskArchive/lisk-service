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
const pouchdb = require('../pouchdb');
const coreApi = require('./compat');

const indexList = [
	'id',
	'generatorPublicKey',
	'generatorAddress',
	'generatorUsername',
	'height',
	'numberOfTransactions',
	'previousBlockId',
	'totalAmount',
	'totalFee',
	['generatorPublicKey', 'numberOfTransactions'],
	['generatorPublicKey', 'totalAmount'],
];

const getSelector = (params) => {
	const result = {};

	const selector = {};
	if (params.height) selector.height = params.height;
	if (params.blockId) selector.id = params.blockId;
	if (params.fromTimestamp) selector.timestamp = { $gte: params.fromTimestamp };
	if (params.toTimestamp) selector.timestamp = { $lte: params.toTimestamp };
	if (params.generatorPublicKey) selector.generatorPublicKey = params.generatorPublicKey;
	result.selector = selector;

	if (params.limit) result.limit = params.limit;
	if (Number(params.offset) >= 0) result.skip = params.offset;

	return result;
};

const getBlocks = async (params) => {
	const blockDb = await pouchdb('blocks', indexList);

	let blocks = {
		data: [],
	};

	/* 	let dbResult;
		if (params.blockId) {
			dbResult = await blockDb.findById(params.blockId);
			if (dbResult !== null) blocks.data = [dbResult];
		}

		if (params.height) {
			dbResult = await blockDb.findOneByProperty('height', Number(params.height));
			if (dbResult.length > 0) blocks.data = dbResult;
		}

		if (params.generatorPublicKey) {
			dbResult = await blockDb.find({
				selector: { generatorAddress: params.generatorPublicKey },
				limit: params.limit,
				skip: params.offset,
			});
			if (dbResult.length > 0) blocks.data = dbResult;
		} */

	const inputData = await getSelector({
		...params,
		limit: params.limit || 10,
		offset: params.offset || 0,
	});
	const dbResult = await blockDb.find(inputData);
	if (dbResult.length > 0) blocks.data = dbResult;

	if (blocks.data.length === 0) {
		blocks = await coreApi.getBlocks(params);
		if (blocks.data.length > 0) blockDb.writeBatch(blocks.data);
	}

	return blocks;
};

module.exports = {
	getBlocks,
};
