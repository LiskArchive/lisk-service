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
} = require('../../../schemas/api_v2/account.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const getDelegates = async params => request(wsRpcUrl, 'get.accounts', params);

describe('Method get.delegates', () => {
	let refDelegate;
	beforeAll(async () => {
		let response;
		do {
			// eslint-disable-next-line no-await-in-loop
			response = await getDelegates({ isDelegate: true, limit: 1 });
		} while (!response.result);
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

		it('returns delegates matching search param', async () => {
			const response = await getDelegates({ isDelegate: true, search: 'genesis' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(resultEnvelopeSchema);
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.summary.username).toContain('genesis');
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
				isDelegate: true, publicKey: refDelegate.summary.publicKey,
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

	describe('returns delegates based on status', () => {
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
			expect(result.meta).toMap(metaSchema);
		});

		it('returns standby delegates by status', async () => {
			const response = await getDelegates({ isDelegate: true, status: 'standby' });
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

		it('returns both active and standby delegates by status', async () => {
			const response = await getDelegates({ isDelegate: true, status: 'active,standby' });
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
	});

	describe('Delegate accounts sorted by balance', () => {
		it('returns 10 delegate accounts sorted by balance descending', async () => {
			const response = await getDelegates({ isDelegate: true, sort: 'balance:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevAccount = result.data[i - 1];
					const currAccount = result.data[i];
					expect(BigInt(prevAccount.summary.balance))
						.toBeGreaterThanOrEqual(BigInt(currAccount.summary.balance));
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('returns 10 delegate accounts sorted by balance ascending', async () => {
			const response = await getDelegates({ isDelegate: true, sort: 'balance:asc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevAccount = result.data[i - 1];
					const currAccount = result.data[i];
					expect(BigInt(prevAccount.summary.balance))
						.toBeLessThanOrEqual(BigInt(currAccount.summary.balance));
				}
			}
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Delegate accounts sorted by rank', () => {
		it('returns 10 delegate accounts sorted by rank descending', async () => {
			const response = await getDelegates({ isDelegate: true, sort: 'rank:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevAccount = result.data[i - 1];
					const currAccount = result.data[i];
					expect(prevAccount.dpos.delegate.rank).toBeGreaterThan(currAccount.dpos.delegate.rank);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('returns 10 delegate accounts sorted by rank ascending', async () => {
			const response = await getDelegates({ isDelegate: true, sort: 'rank:asc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevAccount = result.data[i - 1];
					const currAccount = result.data[i];
					expect(prevAccount.dpos.delegate.rank).toBeLessThan(currAccount.dpos.delegate.rank);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});
	});


	describe('Search genesis delegate accounts with sorting specified', () => {
		it('returns 10 delegate accounts sorted by balance descending', async () => {
			const response = await getDelegates({ isDelegate: true, search: 'genesis', sort: 'balance:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevAccount = result.data[i - 1];
					const currAccount = result.data[i];
					expect(BigInt(prevAccount.summary.balance))
						.toBeGreaterThanOrEqual(BigInt(currAccount.summary.balance));
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('returns 10 delegate accounts sorted by balance descending with limit & offset', async () => {
			const response = await getDelegates({ isDelegate: true, search: 'genesis', sort: 'balance:desc', limit: 5, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(5);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevAccount = result.data[i - 1];
					const currAccount = result.data[i];
					expect(BigInt(prevAccount.summary.balance))
						.toBeGreaterThanOrEqual(BigInt(currAccount.summary.balance));
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('returns 10 delegate accounts sorted by balance ascending', async () => {
			const response = await getDelegates({ isDelegate: true, search: 'genesis', sort: 'balance:asc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevAccount = result.data[i - 1];
					const currAccount = result.data[i];
					expect(BigInt(prevAccount.summary.balance))
						.toBeLessThanOrEqual(BigInt(currAccount.summary.balance));
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('returns 10 delegate accounts sorted by balance ascending with limit & offset', async () => {
			const response = await getDelegates({ isDelegate: true, search: 'genesis', sort: 'balance:asc', limit: 5, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(5);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevAccount = result.data[i - 1];
					const currAccount = result.data[i];
					expect(BigInt(prevAccount.summary.balance))
						.toBeLessThanOrEqual(BigInt(currAccount.summary.balance));
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('returns 10 delegate accounts sorted by rank descending', async () => {
			const response = await getDelegates({ isDelegate: true, search: 'genesis', sort: 'rank:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevAccount = result.data[i - 1];
					const currAccount = result.data[i];
					expect(prevAccount.dpos.delegate.rank).toBeGreaterThan(currAccount.dpos.delegate.rank);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('returns 10 delegate accounts sorted by rank descending with limit & offset', async () => {
			const response = await getDelegates({ isDelegate: true, search: 'genesis', sort: 'rank:desc', limit: 5, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(5);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevAccount = result.data[i - 1];
					const currAccount = result.data[i];
					expect(prevAccount.dpos.delegate.rank).toBeGreaterThan(currAccount.dpos.delegate.rank);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('returns 10 delegate accounts sorted by rank ascending', async () => {
			const response = await getDelegates({ isDelegate: true, search: 'genesis', sort: 'rank:asc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevAccount = result.data[i - 1];
					const currAccount = result.data[i];
					expect(prevAccount.dpos.delegate.rank).toBeLessThan(currAccount.dpos.delegate.rank);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('returns 10 delegate accounts sorted by rank ascending with limit & offset', async () => {
			const response = await getDelegates({ isDelegate: true, search: 'genesis', sort: 'rank:asc', limit: 5, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(5);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevAccount = result.data[i - 1];
					const currAccount = result.data[i];
					expect(prevAccount.dpos.delegate.rank).toBeLessThan(currAccount.dpos.delegate.rank);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});
	});
});
