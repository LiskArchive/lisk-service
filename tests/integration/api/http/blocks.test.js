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
/* eslint-disable quotes, quote-props, comma-dangle */
const config = require('../../../config');
const { api } = require('../../../helpers/api');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const endpoint = `${baseUrlV1}/blocks`;

const {
	goodRequestSchema,
	badRequestSchema,
	notFoundSchema,
	wrongInputParamSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	blockSchema,
} = require('../../../schemas/block.schema');

describe('Blocks API', () => {
	let refBlock;
	let refDelegate;
	beforeAll(async () => {
		[refBlock] = (await api.get(`${endpoint}?limit=1`)).data;
		[refDelegate] = (await api.get(`${baseUrlV1}/delegates?limit=1`)).data;
	});

	describe('GET /blocks', () => {
		it('returns list of blocks when called with no params', async () => {
			const response = await api.get(`${endpoint}?limit=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.length).toEqual(1);
			response.data.forEach(block => expect(block).toMap(blockSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('known block by block ID -> ok', async () => {
			const response = await api.get(`${endpoint}?id=${refBlock.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.length).toEqual(1);
			response.data.forEach(block => expect(block).toMap(blockSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('known block by height -> ok', async () => {
			const response = await api.get(`${endpoint}?height=23`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.length).toEqual(1);
			expect(response.data[0].height).toEqual(23);
			response.data.forEach(block => expect(block).toMap(blockSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('known block by account -> ok', async () => {
			const response = await api.get(`${endpoint}?address=${refDelegate.address}`);
			expect(response).toMap(goodRequestSchema);
			response.data.forEach(block => {
				expect(block).toMap(blockSchema);
				expect(block.generatorAddress).toEqual(refDelegate.address);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('known block by publickey -> ok', async () => {
			const response = await api.get(`${endpoint}?address=${refDelegate.publicKey}`);
			expect(response).toMap(goodRequestSchema);
			response.data.forEach(block => {
				expect(block).toMap(blockSchema);
				expect(block.generatorPublicKey).toEqual(refDelegate.publicKey);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('known block by username -> ok', async () => {
			const response = await api.get(`${endpoint}?address=${refDelegate.username}`);
			expect(response).toMap(goodRequestSchema);
			response.data.forEach(block => {
				expect(block).toMap(blockSchema);
				expect(block.generatorUsername).toEqual(refDelegate.username);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('block list by unknown account ID fails with 404', async () => {
			const response = await api.get(`${endpoint}?address=122233344455667L`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('too long block id -> 400', async () => {
			const response = await api.get(`${endpoint}?id=fkfkfkkkffkfkfk10101010101010101010`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('empty block ID -> retrieve all', async () => {
			const response = await api.get(`${endpoint}?id=`);
			expect(response).toMap(goodRequestSchema);
			response.data.forEach(block => expect(block).toMap(blockSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('non-existent block id -> 404', async () => {
			const response = await api.get(`${endpoint}?id=12602944501676077162`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('invalid query parameter -> 400', async () => {
			const response = await api.get(`${endpoint}?block=12602944501676077162`, 400);
			expect(response).toMap(wrongInputParamSchema);
		});

		it('non-existent height -> 404', async () => {
			const response = await api.get(`${endpoint}?height=2000000000`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('empty height -> retrieve all', async () => {
			const response = await api.get(`${endpoint}?height=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.length).toEqual(10);
			response.data.forEach(block => expect(block).toMap(blockSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('limit=100 -> ok', async () => {
			const response = await api.get(`${endpoint}?limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(100);
			response.data.forEach(block => expect(block).toMap(blockSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('limit=0 -> 400', async () => {
			const response = await api.get(`${endpoint}?limit=0`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('empty limit -> retrieve all', async () => {
			const response = await api.get(`${endpoint}?limit=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(10);
			response.data.forEach(block => expect(block).toMap(blockSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('retrieve block by username -> ok', async () => {
			const response = await api.get(`${endpoint}?username=${refDelegate.username}`);
			expect(response).toMap(goodRequestSchema);
			response.data.forEach(block => {
				expect(block).toMap(blockSchema);
				expect(block.generatorUsername).toEqual(refDelegate.username);
			});
			expect(response.meta).toMap(metaSchema);
		});
	});
});
