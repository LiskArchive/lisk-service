/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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

const normalizeBlock = block => {
	/*
		{
			version: 2,
			timestamp: 1610117397,
			height: 500,
			previousBlockID: <Buffer 36 0e 78 f0 50 cb c3 96 91 9e 3c a7 37 ab e0 4f 29 94 02 23 7d ff a7 35 66 6c 4d 34 cb ef 4a fd>,
			transactionRoot: <Buffer e3 b0 c4 42 98 fc 1c 14 9a fb f4 c8 99 6f b9 24 27 ae 41 e4 64 9b 93 4c a4 95 99 1b 78 52 b8 55>,
			generatorPublicKey: <Buffer d6 20 97 94 42 c7 85 46 f7 9b 86 c2 56 5c 77 de a7 f0 fa d9 c1 e3 1d 8b 6b 4d 06 69 30 c9 1a 2f>,
			reward: 0n,
			asset: {
				maxHeightPreviouslyForged: 334,
				maxHeightPrevoted: 430,
				seedReveal: <Buffer 63 ef 9a 67 06 2f 3f 68 46 ed 49 6f 1a 09 7a 58>
			},
			signature: <Buffer 49 84 16 e0 46 ac 36 47 75 22 a8 1e 83 75 e2 ca ae 3d 81 99 7a aa 13 7e e7 55 51 1f 92 8f 1a da 65 4a 6e ad bc 8a 66 92 85 0e 6a 29 41 9d 63 d8 60 87 ... 14 more bytes>,
			id: <Buffer 45 0f 24 1b 35 39 33 63 b5 b1 5f cc 09 90 73 3c cc 85 fb fe 4e c8 91 17 03 7f 56 b7 c6 c8 a3 d7>
		}
	*/

	block.id = block.id.toString('hex');
	block.signature = block.signature.toString('hex');
	block.previousBlockID = block.previousBlockID.toString('hex');
	block.transactionRoot = block.transactionRoot.toString('hex');
	block.generatorPublicKey = block.generatorPublicKey.toString('hex');
	block.asset.seedReveal = block.asset.seedReveal.toString('hex');

	return block;
};

const getBlocks = async params => {
	const blocks = {
		data: [],
		meta: {},
	};

	await Promise.all(['fromTimestamp', 'toTimestamp'].map(async (timestamp) => {
		if (await validateTimestamp(params[timestamp])) {
			params[timestamp] = await getBlockchainTime(params[timestamp]);
		}
		return Promise.resolve();
	}),
	);

	const response = await coreApi.getBlocks(params);
	if (response.data) blocks.data = response.data.map(block => normalizeBlock(block.header));
	if (response.meta) blocks.meta = response.meta; // TODO: Build meta manually

	await Promise.all(
		blocks.data.map(async (o) => Object.assign(o, {
			unixTimestamp: await getUnixTime(o.timestamp),
			isImmutable: currentHeight - o.height >= considerFinalHeight,
		})),
	);

	return blocks;
};

module.exports = {
	getBlocks,
};
