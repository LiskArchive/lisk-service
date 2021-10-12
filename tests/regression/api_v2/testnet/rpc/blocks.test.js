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
const config = require('../../../../config');
const { request } = require('../../../../helpers/socketIoRpcRequest');

const {
	genesisBlock,
	blockByHeight,
	blocksBetweenHeight,
	blocksBetweenTimestamp,
	blocksByGeneratorAddress,
	blocksByGeneratorPublicKey,
	blocksByGeneratorUsername,
} = require('../expectedResponse/rpc/blocks');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const getBlocks = async params => request(wsRpcUrl, 'get.blocks', params);

describe('Blocks API', () => {
	it(`Retrieve genesis block by height: ${genesisBlock.result.data[0].height}`, async () => {
		const genesisHeight = `${genesisBlock.result.data[0].height}`;
		const response = await getBlocks({ height: genesisHeight });
		expect(response).toStrictEqual(genesisBlock);
	});

	it(`Retrieve genesis block by blockId: ${genesisBlock.result.data[0].id}`, async () => {
		const genesisBlockId = `${genesisBlock.result.data[0].id}`;
		const response = await getBlocks({ blockId: genesisBlockId });
		expect(response).toStrictEqual(genesisBlock);
	});

	it(`Retrieve a block by height: ${blockByHeight.result.data[0].height}`, async () => {
		const blockHeight = `${blockByHeight.result.data[0].height}`;
		const response = await getBlocks({ height: blockHeight });
		expect(response).toStrictEqual(blockByHeight);
	});

	it('Retrieve a block between heights', async () => {
		const fromHeight = blocksBetweenHeight.result.data[0].height
			- (blocksBetweenHeight.result.meta.total - 1);
		const toHeight = blocksBetweenHeight.result.data[0].height;
		const response = await getBlocks({ height: `${fromHeight}:${toHeight}` });
		expect(response).toStrictEqual(blocksBetweenHeight);
	});

	it('Retrieve a block between timestamps', async () => {
		const toTime = blocksBetweenTimestamp.result.data[0].timestamp;
		const fromTime = toTime - blocksBetweenTimestamp.result.meta.total * 10;
		const response = await getBlocks({ timestamp: `${fromTime}:${toTime}` });
		expect(response).toStrictEqual(blocksBetweenTimestamp);
	});

	it('Retrieve blocks by generatorAddress', async () => {
		const { generatorAddress } = blocksByGeneratorAddress.result.data[0];
		const response = await getBlocks({ generatorAddress, sort: 'timestamp:asc' });

		// response.data
		expect(response.result.data).toStrictEqual(blocksByGeneratorAddress.result.data);

		// response.meta
		expect(response.result.meta.count).toStrictEqual(blocksByGeneratorAddress.result.meta.count);
		expect(response.result.meta.offset).toStrictEqual(blocksByGeneratorAddress.result.meta.offset);
		expect(response.result.meta.total)
			.toBeGreaterThanOrEqual(blocksByGeneratorAddress.result.meta.total);
	});

	it('Retrieve blocks by generatorPublicKey', async () => {
		const { generatorPublicKey } = blocksByGeneratorPublicKey.result.data[0];
		const response = await getBlocks({ generatorPublicKey, sort: 'timestamp:asc' });

		// response.data
		expect(response.result.data).toStrictEqual(blocksByGeneratorPublicKey.result.data);

		// response.meta
		expect(response.result.meta.count).toStrictEqual(blocksByGeneratorPublicKey.result.meta.count);
		expect(response.result.meta.offset)
			.toStrictEqual(blocksByGeneratorPublicKey.result.meta.offset);
		expect(response.result.meta.total)
			.toBeGreaterThanOrEqual(blocksByGeneratorPublicKey.result.meta.total);
	});

	it('Retrieve blocks by generatorUsername', async () => {
		const { generatorUsername } = blocksByGeneratorUsername.result.data[0];
		const response = await getBlocks({ generatorUsername, sort: 'timestamp:asc' });

		// response.data
		expect(response.result.data).toStrictEqual(blocksByGeneratorUsername.result.data);

		// response.meta
		expect(response.result.meta.count).toStrictEqual(blocksByGeneratorUsername.result.meta.count);
		expect(response.result.meta.offset).toStrictEqual(blocksByGeneratorUsername.result.meta.offset);
		expect(response.result.meta.total)
			.toBeGreaterThanOrEqual(blocksByGeneratorUsername.result.meta.total);
	});
});
