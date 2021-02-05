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
const config = require('../../../config');
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	resultEnvelopeSchema,
	emptyResponseSchema,
	emptyResultEnvelopeSchema,
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	delegateSchema,
} = require('../../../schemas/delegate.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;
const getDelegates = async params => request(wsRpcUrl, 'get.delegates', params);

describe('Method get.delegates', () => {
	let refDelegate;
	beforeAll(async () => {
		const response = await getDelegates({ limit: 1 });
		[refDelegate] = response.result.data;
	});

	describe('returns delegates lists', () => {
		it('returns top 10 delegates by default', async () => {
			const response = await getDelegates({});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeArrayOfSize(10);
			result.data.forEach(delegate => expect(delegate).toMap(delegateSchema));
			expect(result.meta).toMap(metaSchema, { count: 10, offset: 0 });
		});

		it('returns delegates matching search param', async () => {
			const response = await getDelegates({ search: 'genesis_1' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			result.data.forEach(delegate => {
				expect(delegate).toMap(delegateSchema);
				expect(delegate.username).toContain('genesis_1');
			});
			expect(result.meta).toMap(metaSchema, { offset: 0 });
		});

		it('returns delegates matching search param and correct total', async () => {
			const limit = 5;
			const response = await getDelegates({ search: 'genesis_1', limit });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(limit);
			result.data.forEach(delegate => {
				expect(delegate).toMap(delegateSchema);
				expect(delegate.username).toContain('genesis_1');
			});
			expect(result.meta).toMap(metaSchema, { count: limit, offset: 0 });
		});

		it('returns one result when limit = 1', async () => {
			const limit = 1;
			const response = await getDelegates({ limit });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(limit);
			result.data.forEach(delegate => expect(delegate).toMap(delegateSchema));
			expect(result.meta).toMap(metaSchema, { count: limit, offset: 0 });
		});

		it('is able to perform full-text search on delegates', async () => {
			const response = await getDelegates({ search: 'genesis' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			result.data.forEach(delegate => {
				expect(delegate).toMap(delegateSchema);
				expect(delegate.username).toInclude('genesis');
			});
			expect(result.meta).toMap(metaSchema, { offset: 0 });
		});
	});

	describe('returns delegates based on address', () => {
		it('returns known delegate by address', async () => {
			const response = await getDelegates({ address: refDelegate.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeArrayOfSize(1);
			result.data.forEach(delegate => expect(delegate)
				.toMap(delegateSchema, { address: refDelegate.address }));
			expect(result.meta).toMap(metaSchema, { count: 1, offset: 0 });
		});

		it('returns empty data ([]) when invalid address', async () => {
			const response = await getDelegates({ address: '412875216073141752800000' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('returns delegates based on username', () => {
		it('returns known delegate by username', async () => {
			const response = await getDelegates({ username: refDelegate.username });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeArrayOfSize(1);
			result.data.forEach(delegate => expect(delegate)
				.toMap(delegateSchema, { username: refDelegate.username }));
			expect(result.meta).toMap(metaSchema, { count: 1, offset: 0 });
		});

		it('returns empty data ([]) on wrong username', async () => {
			const response = await getDelegates({ username: 'genesis_510000000' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('returns delegates based on public key', () => {
		it('returns known delegate by public key', async () => {
			const response = await getDelegates({ publickey: refDelegate.publicKey });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeArrayOfSize(1);
			result.data.forEach(delegate => expect(delegate)
				.toMap(delegateSchema, { publicKey: refDelegate.publicKey }));
			expect(result.meta).toMap(metaSchema, { count: 1, offset: 0 });
		});

		it('returns empty object ({}) on wrong delegate public key', async () => {
			const response = await getDelegates({ publickey: '412875216073141752800000' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('returns delegates based on second public key', () => {
		it('returns known delegate by second public key', async () => {
			if (refDelegate.secPublicKey) {
				const response = await getDelegates({ secpubkey: refDelegate.secPublicKey });
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result).toMap(resultEnvelopeSchema);
				expect(result.data).toBeArrayOfSize(1);
				result.data.forEach(delegate => expect(delegate)
					.toMap(delegateSchema, { secPublicKey: refDelegate.secPublicKey }));
				expect(result.meta).toMap(metaSchema, { count: 1, offset: 0 });
			}
		});

		it('returns empty object ({}) on wrong delegate second public key', async () => {
			const response = await getDelegates({ secpubkey: '412875216073141752800000' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('returns delegates based on status', () => {
		it('returns active delegates by status', async () => {
			const response = await getDelegates({ status: 'active' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeArrayOfSize(10);
			result.data.forEach(delegate => expect(delegate).toMap(delegateSchema, { status: 'active' }));
			expect(result.meta).toMap(metaSchema, { count: 10, offset: 0 });
		});

		it('returns standby delegates by status', async () => {
			const response = await getDelegates({ status: 'standby' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeArrayOfSize(10);
			result.data.forEach(delegate => expect(delegate).toMap(delegateSchema, { status: 'standby' }));
			expect(result.meta).toMap(metaSchema, { count: 10, offset: 0 });
		});

		it('returns both active and standby delegates by status', async () => {
			const response = await getDelegates({ status: 'active,standby', offset: 95 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeArrayOfSize(10);
			result.data.forEach(delegate => expect(delegate).toMap(delegateSchema));
			expect(result.meta).toMap(metaSchema, { count: 10, offset: 95 });
		});

		it('returns INVALID_PARAMS (-32602) with wrong delegate status value', async () => {
			const response = await getDelegates({ status: 'falseValue' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('returns INVALID_PARAMS', () => {
		// current response is -32600 as invalid parameter response
		it('returns INVALID_PARAMS (-32602) when invalid param name', async () => {
			const response = await getDelegates({ id: '412875216073141752800000' }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		});

		// current response is -32600 as invalid parameter response
		it('returns INVALID_PARAMS error (-32602) with limit = 0', async () => {
			const response = await getDelegates({ limit: 0 }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		});

		// Given test fails during CI phase
		xit('returns INVALID_PARAMS error (-32602) with empty limit (\'\')', async () => {
			const response = await getDelegates({ limit: '' }).catch(e => e);
			expect(response).toMap(emptyResultEnvelopeSchema);
		});
	});
});
