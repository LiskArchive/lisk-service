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
	invalidParamsSchema,
	emptyResultEnvelopeSchema,
	emptyResponseSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	accountSchemaVersion5,
	dpos,
} = require('../../../schemas/api_v2/account.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const getAccounts = async params => request(wsRpcUrl, 'get.accounts', params);

describe('Method get.accounts', () => {
	let refDelegate;
	beforeAll(async () => {
		const response = await request(wsRpcUrl, 'get.accounts', { isDelegate: true, limit: 1 });
		[refDelegate] = response.result.data;
	});

	describe('is able to retrieve account lists', () => {
		it('returns account details with no params', async () => {
			const response = await getAccounts({});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			expect(result.meta).toMap(metaSchema);
		});

		it('allows to retrieve list of non-delegate accounts with \'isDelegate=false\'', async () => {
			const response = await getAccounts({ isDelegate: false });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.summary.isDelegate).toBeFalsy();
			});
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('is able to retrieve account based on address', () => {
		it('returns account details on known address', async () => {
			const response = await getAccounts({ address: refDelegate.summary.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data.length).toEqual(1);
			result.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			expect(result.meta).toMap(metaSchema);
		});

		it('returns account details when known address is written lowercase', async () => {
			const response = await getAccounts({ address: refDelegate.summary.address.toLowerCase() });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data.length).toEqual(1);
			result.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			expect(result.meta).toMap(metaSchema);
		});

		it('returns empty response when unknown address', async () => {
			const response = await getAccounts({ address: '99999L' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('returns INVALID_PARAMS error (-32602) on invalid address', async () => {
			const response = await getAccounts({ address: 'L' }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retrieve account based on public key', () => {
		it('returns account details on known public key', async () => {
			const response = await getAccounts({ publicKey: refDelegate.summary.publicKey });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data.length).toEqual(1);
			result.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
			expect(result.meta).toMap(metaSchema);
		});

		it('returns empty response on invalid public key', async () => {
			const response = await getAccounts({ address: '' }).catch(e => e);
			expect(response).toMap(emptyResponseSchema);
		});

		it('returns empty response on unknown public key', async () => {
			const response = await getAccounts({ publicKey: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve account based on second public key', () => {
		it('returns account details on known second public key', async () => {
			if (refDelegate.secondPublicKey) {
				const { result } = await getAccounts({ secpubkey: refDelegate.secondPublicKey });
				expect(result.data.length).toEqual(1);
				expect(result.data[0]).toMap(accountSchemaVersion5, { address: refDelegate.address });
			}
		});
	});

	describe('is able to retrieve delegate account details', () => {
		it('returns delegate data by address', async () => {
			const response = await getAccounts({ address: refDelegate.summary.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data.length).toEqual(1);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns delegate data by delegate name', async () => {
			const response = await getAccounts({ username: refDelegate.summary.username });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data.length).toEqual(1);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve accounts based on status', () => {
		it('returns delegate accounts when status is active', async () => {
			const response = await getAccounts({ status: 'active' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns delegate accounts based on muliple status', async () => {
			const response = await getAccounts({ status: 'active,standby' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.dpos).toMap(dpos);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns delegate accounts when status is non-eligible', async () => {
			const response = await getAccounts({ status: 'non-eligible' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
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

	describe('Accounts sorted by balance', () => {
		it('returns 10 accounts sorted by balance descending', async () => {
			const response = await getAccounts({ sort: 'balance:desc' });
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

		it('returns 10 accounts sorted by balance ascending', async () => {
			const response = await getAccounts({ sort: 'balance:asc' });
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

	describe('Fetch accounts based on multiple request params', () => {
		it('search \'genesis\' and sort balance descending', async () => {
			const response = await getAccounts({ search: 'genesis', sort: 'balance:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.summary.username.includes('genesis')).toBeTruthy();
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

		it('search \'genesis\' and sort balance ascending', async () => {
			const response = await getAccounts({ search: 'genesis', sort: 'balance:asc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(account => {
				expect(account).toMap(accountSchemaVersion5);
				expect(account.summary.username.includes('genesis')).toBeTruthy();
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

		it('non-delegate accounts, sort balance descending, with limit and offset', async () => {
			const response = await getAccounts({ isDelegate: false, sort: 'balance:desc', limit: 5, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
			result.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
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

		it('non-delegate accounts, sort balance ascending, with limit and offset', async () => {
			const response = await getAccounts({ isDelegate: false, sort: 'balance:asc', limit: 5, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
			result.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
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

		it('non-delegate accounts with \'active\' status returns empty response', async () => {
			const response = await getAccounts({ isDelegate: false, status: 'active' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('non-delegate accounts with \'any\' status returns invalid params', async () => {
			const response = await getAccounts({ isDelegate: false, status: 'any' });
			expect(response).toMap(invalidParamsSchema);
		});
	});
});
