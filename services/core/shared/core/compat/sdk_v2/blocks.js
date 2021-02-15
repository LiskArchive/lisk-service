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
	getUnixTime,
	getBlockchainTime,
	validateTimestamp,
} = require('../common');

let currentHeight = 0;
const considerFinalHeight = 202;

const getBlocks = async params => {
	await Promise.all(['fromTimestamp', 'toTimestamp'].map(async (timestamp) => {
		if (await validateTimestamp(params[timestamp])) {
			params[timestamp] = await getBlockchainTime(params[timestamp]);
		}
		return Promise.resolve();
	}),
	);

	const blocks = await coreApi.getBlocks(params);

	if (blocks.data) {
		blocks.data.forEach(block => {
			if (block.height > currentHeight) currentHeight = block.height;
		});

		await Promise.all(blocks.data.map(async (o) => Object.assign(o, {
			unixTimestamp: await getUnixTime(o.timestamp),
			isImmutable: (currentHeight - o.height >= considerFinalHeight),
		}),
		));
	}

	return blocks;
};

module.exports = { getBlocks };

// const pushToDb = async (blockDb, blocks) => {
// 	const propList = [
// 		'blockSignature',
// 		'generatorAddress',
// 		'generatorPublicKey',
// 		'height',
// 		'id',
// 		'numberOfTransactions',
// 		'payloadHash',
// 		'payloadLength',
// 		'previousBlockId',
// 		'reward',
// 		'totalAmount',
// 		'totalFee',
// 		'totalForged',
// 		'unixTimestamp',
// 		'version',
// 		'isFinal',
// 	];
// 	const out = blocks.map(o => {
// 		const obj = {};
// 		propList.map(prop => obj[prop] = o[prop]);
// 		return obj;
// 	});
// 	return blockDb.writeBatch(out);
// };

// const getBlocksFromCache = async params => {
// 	const blockDb = await pouchdb(config.db.collections.blocks.name);

// 	const inputData = getSelector({
// 		...params,
// 		limit: params.limit || 10,
// 		offset: params.offset || 0,
// 	});

// 	const dbResult = await blockDb.find(inputData);

// 	if (dbResult.length && dbResult.every(item => item)) {
// 		const blocks = dbResult.map((block) => ({
// 			...block,
// 			confirmations: (getLastBlock().height) - block.height + (getLastBlock().confirmations),
// 		}));

// 		return blocks;
// 	}

// 	return [];
// };

// if (skipCache !== true && (params.blockId
// 	|| params.height
// 	|| params.isFinal === true
// 	|| params.isImmutable === true)) { // try to get from cache
// 	blocks.data = await getBlocksFromCache(params);
// }

// const cleanFromForks = async (n) => {
// 	const blockDb = await pouchdb(config.db.collections.blocks.name);
// 	const blocks = await blockDb.find({
// 		selector: {
// 			height: { $gte: (getLastBlock()).height - n },
// 		},
// 		sort: ['height'],
// 	});
// 	const orphanList = blocks.reverse().filter((block, idx) => {
// 		if (idx + 1 >= blocks.length) return false;
// 		const prevBlock = blocks[idx + 1];
// 		if (prevBlock.id !== block.previousBlockId) return true;
// 		return false;
// 	});

// 	// TODO: orphanList removal from PouchDB
// 	logger.debug(`Found ${orphanList.length} orphaned blocks...`);
// 	return orphanList;
// };
