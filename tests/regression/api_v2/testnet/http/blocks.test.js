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
const { api } = require('../../../../helpers/api');

const {
	genesisBlock,
	blockByHeight,
	blocksBetweenHeight,
	blocksBetweenTimestamp,
	blocksByGeneratorAddress,
	blocksByGeneratorPublicKey,
	blocksByGeneratorUsername,
} = require('../expectedResponse/http/blocks');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/blocks`;

describe('Blocks API', () => {
	it(`Retrieve genesis block by height: ${genesisBlock.data[0].height}`, async () => {
		const genesisHeight = genesisBlock.data[0].height;
		const response = await api.get(`${endpoint}?height=${genesisHeight}`);
		expect(response).toStrictEqual(genesisBlock);
	});

	it(`Retrieve genesis block by blockId: ${genesisBlock.data[0].id}`, async () => {
		const genesisBlockId = genesisBlock.data[0].id;
		const response = await api.get(`${endpoint}?blockId=${genesisBlockId}`);
		expect(response).toStrictEqual(genesisBlock);
	});

	it(`Retrieve a block by height: ${blockByHeight.data[0].height}`, async () => {
		const blockHeight = blockByHeight.data[0].height;
		const response = await api.get(`${endpoint}?height=${blockHeight}`);
		expect(response).toStrictEqual(blockByHeight);
	});

	it('Retrieve a block between heights', async () => {
		const fromHeight = blocksBetweenHeight.data[0].height - (blocksBetweenHeight.meta.total - 1);
		const toHeight = blocksBetweenHeight.data[0].height;
		const response = await api.get(`${endpoint}?height=${fromHeight}:${toHeight}`);
		expect(response).toStrictEqual(blocksBetweenHeight);
	});

	it('Retrieve a block between timestamps', async () => {
		const toTime = blocksBetweenTimestamp.data[0].timestamp;
		const fromTime = toTime - blocksBetweenTimestamp.meta.total * 10;
		const response = await api.get(`${endpoint}?timestamp=${fromTime}:${toTime}`);
		expect(response).toStrictEqual(blocksBetweenTimestamp);
	});

	it('Retrieve blocks by generatorAddress', async () => {
		const { generatorAddress } = blocksByGeneratorAddress.data[0];
		const response = await api.get(`${endpoint}?sort=timestamp:asc&generatorAddress=${generatorAddress}`);

		// response.data
		expect(response.data).toStrictEqual(blocksByGeneratorAddress.data);

		// response.meta
		expect(response.meta.count).toStrictEqual(blocksByGeneratorAddress.meta.count);
		expect(response.meta.offset).toStrictEqual(blocksByGeneratorAddress.meta.offset);
		expect(response.meta.total).toBeGreaterThanOrEqual(blocksByGeneratorAddress.meta.total);
	});

	it('Retrieve blocks by generatorPublicKey', async () => {
		const { generatorPublicKey } = blocksByGeneratorPublicKey.data[0];
		const response = await api.get(`${endpoint}?sort=timestamp:asc&generatorPublicKey=${generatorPublicKey}`);

		// response.data
		expect(response.data).toStrictEqual(blocksByGeneratorPublicKey.data);

		// response.meta
		expect(response.meta.count).toStrictEqual(blocksByGeneratorPublicKey.meta.count);
		expect(response.meta.offset).toStrictEqual(blocksByGeneratorPublicKey.meta.offset);
		expect(response.meta.total).toBeGreaterThanOrEqual(blocksByGeneratorPublicKey.meta.total);
	});

	it('Retrieve blocks by generatorUsername', async () => {
		const { generatorUsername } = blocksByGeneratorUsername.data[0];
		const response = await api.get(`${endpoint}?sort=timestamp:asc&generatorUsername=${generatorUsername}`);

		// response.data
		expect(response.data).toStrictEqual(blocksByGeneratorUsername.data);

		// response.meta
		expect(response.meta.count).toStrictEqual(blocksByGeneratorUsername.meta.count);
		expect(response.meta.offset).toStrictEqual(blocksByGeneratorUsername.meta.offset);
		expect(response.meta.total).toBeGreaterThanOrEqual(blocksByGeneratorUsername.meta.total);
	});
});
