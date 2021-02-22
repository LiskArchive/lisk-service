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
const util = require('util');

const config = require('../../../config');

const {
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	emptyResultEnvelopeSchema,
	emptyResponseSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	blockSchema,
} = require('../../../schemas/block.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const getBlocks = async params => request(wsRpcUrl, 'get.blocks', params);

xdescribe('Method get.blocks', () => {
	let refBlock;
	let refDelegate;
	beforeAll(async () => {
		[refBlock] = (await getBlocks({ limit: 1 })).result.data;
		[refDelegate] = (await request(wsRpcUrl, 'get.delegates', { limit: 1 })).result.data;
	});

	describe('is able to retireve block lists', () => {
		it.only('no params -> ok', async () => {
			const response = await getBlocks({});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data.length).toEqual(10);
			result.data.forEach(block => expect(block).toMap(blockSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('limit=100 -> ok', async () => {
			const response = await getBlocks({ limit: 100 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data.length).toEqual(100);
			result.data.forEach(block => expect(block).toMap(blockSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('offset -> ok', async () => {
			const [...topTenBlocks] = (await getBlocks({})).result.data;
			const [...topTenOffsetBlocks] = (await getBlocks({ offset: 1 })).result.data;

			[...Array(topTenBlocks.length)].forEach((_, i) => {
				if (i) expect(util.isDeepStrictEqual(topTenBlocks[i], topTenOffsetBlocks[i - 1]))
					.toBeTruthy();
			});
		});

		it('limit & offset -> ok', async () => {
			const [...topTenBlocks] = (await getBlocks({})).result.data;
			const [...topTenOffsetBlocks] = (await getBlocks({ offset: 1, limit: 12 })).result.data;

			[...Array(topTenBlocks.length)].forEach((_, i) => {
				if (i) expect(util.isDeepStrictEqual(topTenBlocks[i], topTenOffsetBlocks[i - 1]))
					.toBeTruthy();
			});
		});
	});

	describe('is able to retireve block details by block ID', () => {
		it('known block by block ID -> ok', async () => {
			const response = await getBlocks({ id: refBlock.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data.length).toEqual(1);
			result.data.forEach(block => expect(block).toMap(blockSchema, { id: refBlock.id }));
			expect(result.meta).toMap(metaSchema);
		});

		it('too long block id -> empty response', async () => {
			const response = await getBlocks({ id: 'fkfkfkkkffkfkfk1010101010101010101' }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		});

		// TODO
		xit('too short block id -> -32602', async () => {
			const response = await getBlocks({ id: '' }).catch(e => e);
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('invalid block id -> empty response', async () => {
			const response = await getBlocks({ id: '12602944501676077162' }).catch(e => e);
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('invalid query parameter -> -32602', async () => {
			const response = await getBlocks({ block: '12602944501676077162' }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retireve block details by height', () => {
		it('known block by height -> ok', async () => {
			const response = await getBlocks({ height: refBlock.height });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data.length).toEqual(1);
			expect(result.data[0]).toMap(blockSchema, { height: refBlock.height });
		});

		it('non-existent height -> empty response', async () => {
			const response = await getBlocks({ height: 2000000000 });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('height = 0 -> -32602', async () => {
			const response = await getBlocks({ height: 0 }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		});

		// TODO
		xit('empty height -> -32602 ', async () => {
			const response = await getBlocks({ limit: '' }).catch(e => e);
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retireve block lists by account address', () => {
		it('block list by known account ID', async () => {
			const response = await getBlocks({ address: refDelegate.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			result.data.forEach((blockData) => {
				expect(blockData).toMap(blockSchema, { generatorAddress: refDelegate.address });
			});
		});

		// TODO: Fails the CI pipeline
		xit('block list by invalid account ID returns empty list', async () => {
			const response = await getBlocks({ address: '122233344455667L' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retireve block lists by account public key', () => {
		it('known block by publickey -> ok', async () => {
			const response = await getBlocks({ address: refDelegate.publicKey });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			result.data.forEach((blockData) => {
				expect(blockData)
					.toMap(blockSchema, { generatorPublicKey: refDelegate.publicKey });
			});
		});
	});

	describe('is able to retireve block lists by account username', () => {
		it('known block by username -> ok', async () => {
			const response = await getBlocks({ address: refDelegate.username });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			result.data.forEach((blockData) => {
				expect(blockData).toMap(blockSchema, { generatorUsername: refDelegate.username });
			});
		});
	});

	describe('is able to retireve block lists by timestamp', () => {
		it('Blocks with from...to timestamp -> ok', async () => {
			const from = 1497855770;
			const to = 1497855780;
			const response = await getBlocks({ from, to });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data.length).toEqual(2);
			expect(result.data[0]).toMap(blockSchema);
			result.data.forEach((blockItem) => {
				expect(blockItem.timestamp).toBeGreaterThanOrEqual(from);
				expect(blockItem.timestamp).toBeLessThanOrEqual(to);
			});
		});
	});

	describe('retireve block lists by username', () => {
		it('retrieve block by username -> ok', async () => {
			const { result } = await getBlocks({ username: 'cc001' });
			result.data.forEach((blockData) => {
				expect(blockData).toMap(blockSchema, { generatorUsername: 'cc001' });
			});
		});
	});
});
