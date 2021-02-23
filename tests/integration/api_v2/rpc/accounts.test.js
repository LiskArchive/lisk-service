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
	invalidParamsSchema,
	emptyResultEnvelopeSchema,
	emptyResponseSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	accountSchemaVersion5,
	dpos,
} = require('../../../schemas/account.schema');

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
			// expect(result.data.length).toEqual(10);
			result.data.forEach(account => expect(account).toMap(accountSchemaVersion5));
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
			const response = await getAccounts({ publickey: refDelegate.summary.publicKey });
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
			const response = await getAccounts({ publickey: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' });
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
});
