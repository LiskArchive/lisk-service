/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
	emptyResultEnvelopeSchema,
	emptyResponseSchema,
	jsonRpcEnvelopeSchema,
	invalidParamsSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	delegateSchema,
} = require('../../../schemas/api_v3/delegate.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getDelegates = async params => request(wsRpcUrl, 'get.dpos.delegates', params);

// TODO: Enable once Lisk Core is updated
xdescribe('Method get.dpos.delegates', () => {
	let refDelegate;
	beforeAll(async () => {
		const response = await getDelegates({ limit: 1 });
		[refDelegate] = response.result.data;
	});

	describe('Retrieve delegates lists', () => {
		it('returns list of delegates', async () => {
			const response = await getDelegates({});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns list of delegates with limit', async () => {
			const response = await getDelegates({ limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
			result.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns list of delegates with offset', async () => {
			const response = await getDelegates({ offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns list of delegates with combined limit and offset', async () => {
			const response = await getDelegates({ limit: 5, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
			result.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('invalid params: zero limit -> INVALID PARAMS', async () => {
			const response = await getDelegates({ limit: 0 });
			expect(response).toMap(invalidParamsSchema);
		});

		it('invalid params: negative limit -> INVALID PARAMS', async () => {
			const response = await getDelegates({ limit: -5 });
			expect(response).toMap(invalidParamsSchema);
		});

		it('invalid params: negative offset -> INVALID PARAMS', async () => {
			const response = await getDelegates({ offset: -1 });
			expect(response).toMap(invalidParamsSchema);
		});

		it('invalid params -> INVALID PARAMS', async () => {
			const response = await getDelegates({ invalidParam: 'invalidValue' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('Retrieve delegates by address', () => {
		it('returns delegate with known address', async () => {
			if (refDelegate.address) {
				const response = await getDelegates({ address: refDelegate.address });
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result).toMap(resultEnvelopeSchema);
				expect(result.data).toBeInstanceOf(Array);
				expect(result.data.length).toBe(1);
				result.data.forEach((delegate) => {
					expect(delegate).toMap(delegateSchema, { address: refDelegate.address });
				});
				expect(result.meta).toMap(metaSchema);
			}
		});

		it('returns empty response with empty address', async () => {
			const response = await getDelegates({ address: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('returns INVALID PARAMS with invalid address', async () => {
			const response = await getDelegates({ address: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('Retrieve delegates by name', () => {
		it('returns delegate with known name', async () => {
			const response = await getDelegates({ name: refDelegate.name });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBe(1);
			result.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema, { name: refDelegate.name });
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns empty response with empty name', async () => {
			const response = await getDelegates({ name: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('returns INVALID PARAMS with invalid name', async () => {
			const response = await getDelegates({ name: '%&/007jagfkhaf2153yjdkn' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('Retrieve delegates by status', () => {
		it('returns filtered delegates with known status: active', async () => {
			const response = await getDelegates({ status: 'active' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema, { status: 'active' });
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns filtered delegates with known status: standby', async () => {
			const response = await getDelegates({ status: 'standby' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema, { status: 'standby' });
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns filtered delegates with multiple statuses (CSV input)', async () => {
			const statuses = 'standby,punished,banned';
			const response = await getDelegates({ status: statuses });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema);
				expect(statuses.split(',')).toContain(delegate.status);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns empty response with empty status', async () => {
			const response = await getDelegates({ status: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('returns INVALID PARAMS with invalid status', async () => {
			const response = await getDelegates({ status: '%&/007jagfkhaf2153yjdkn' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('Retrieve delegates based on multiple request params', () => {
		it('returns delegate when queried with known address and zero offset', async () => {
			const response = await getDelegates({ address: refDelegate.address, offset: 0 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBe(1);
			result.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema, { address: refDelegate.address });
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns empty response when queried with known address and non-zero offset', async () => {
			const response = await getDelegates({ address: refDelegate.address, offset: 1 });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('returns delegate when queried with known name and zero offset', async () => {
			const response = await getDelegates({ name: refDelegate.name, offset: 0 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBe(1);
			result.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema, { name: refDelegate.name });
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns empty response when queried with known name and non-zero offset', async () => {
			const response = await getDelegates({ name: refDelegate.name, offset: 1 });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('returns delegate when queried with known status and non-zero offset', async () => {
			const statuses = 'active,standby';
			const response = await getDelegates({ status: statuses, offset: 10 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((delegate) => {
				expect(delegate).toMap(delegateSchema);
				expect(statuses.split(',')).toContain(refDelegate.status);
			});
			expect(result.meta).toMap(metaSchema);
		});
	});
});
