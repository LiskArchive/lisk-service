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
const config = require('../../../config');
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	resultEnvelopeSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	accountSchemaVersion5,
	dpos,
} = require('../../../schemas/account.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const getDelegates = async params => request(wsRpcUrl, 'get.accounts', params);

describe('Method get.delegates', () => {
	let refDelegate;
	beforeAll(async () => {
		const response = await getDelegates({ isDelegate: true, limit: 1 });
		[refDelegate] = response.result.data;
	});

	describe('returns delegates lists', () => {
		it('returns top 10 delegates by default', async () => {
			const response = await getDelegates({ isDelegate: true });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(result.meta).toMap(metaSchema);
		});

		// TODO Implement support for search in accounts
		xit('returns delegates matching search param', async () => {
			const response = await getDelegates({ search: 'genesis_1' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.username).toContain('genesis_1');
			});
			expect(result.meta).toMap(metaSchema, { offset: 0 });
		});

		it('returns one result when limit = 1', async () => {
			const limit = 1;
			const response = await getDelegates({ isDelegate: true, limit });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(limit);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(result.meta).toMap(metaSchema, { count: limit, offset: 0 });
		});
	});

	describe('returns delegates based on address', () => {
		it('returns known delegate by address', async () => {
			const response = await getDelegates({
				isDelegate: true, address: refDelegate.summary.address,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeArrayOfSize(1);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(result.meta).toMap(metaSchema, { count: 1, offset: 0 });
		});
	});

	describe('returns delegates based on username', () => {
		it('returns known delegate by username', async () => {
			const response = await getDelegates({
				isDelegate: true, username: refDelegate.summary.username,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeArrayOfSize(1);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(result.meta).toMap(metaSchema, { count: 1, offset: 0 });
		});
	});

	describe('returns delegates based on public key', () => {
		it('returns known delegate by public key', async () => {
			const response = await getDelegates({
				isDelegate: true, publickey: refDelegate.summary.publicKey,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeArrayOfSize(1);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(result.meta).toMap(metaSchema, { count: 1, offset: 0 });
		});
	});

	// Fix delegate search by status
	xdescribe('returns delegates based on status', () => {
		it('returns active delegates by status', async () => {
			const response = await getDelegates({ isDelegate: true, status: 'active' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(result.meta).toMap(metaSchema, { count: 10, offset: 0 });
		});

		it('returns standby delegates by status', async () => {
			const response = await getDelegates({ status: 'standby' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(result.meta).toMap(metaSchema, { count: 10, offset: 0 });
		});

		it('returns both active and standby delegates by status', async () => {
			const response = await getDelegates({ status: 'active,standby', offset: 95 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(result.meta).toMap(metaSchema, { count: 10, offset: 95 });
		});
	});
});
