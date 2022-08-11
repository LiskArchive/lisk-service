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

const {
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	topLSKAddressSchema,
	topLSKAddressMetaSchema,
} = require('../../../schemas/api_v3/topLSKAddress.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getTopAccountsInfo = async (params) => request(wsRpcUrl, 'get.tokens.lsk.top', params);

// TODO: Enable when test blockchain has accounts with balances
xdescribe('get.tokens.lsk.top', () => {
	it('returns lisk top accounts list', async () => {
		const response = await getTopAccountsInfo();
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(account => expect(account).toMap(topLSKAddressSchema));
		if (result.data.length > 1) {
			for (let i = 1; i < result.data.length; i++) {
				const prevAccount = result.data[i - 1];
				const currAccount = result.data[i];
				expect(BigInt(prevAccount.balance)).toBeGreaterThanOrEqual(BigInt(currAccount.balance));
			}
		}
		expect(result.meta).toMap(topLSKAddressMetaSchema);
	});

	it('returns lisk top accounts list with limit=5', async () => {
		const response = await getTopAccountsInfo({ limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(5);
		result.data.forEach(account => expect(account).toMap(topLSKAddressSchema));
		if (result.data.length > 1) {
			for (let i = 1; i < result.data.length; i++) {
				const prevAccount = result.data[i - 1];
				const currAccount = result.data[i];
				expect(BigInt(prevAccount.balance)).toBeGreaterThanOrEqual(BigInt(currAccount.balance));
			}
		}
		expect(result.meta).toMap(topLSKAddressMetaSchema);
	});

	it('returns lisk top accounts list with limit=5 & offset=1', async () => {
		const response = await getTopAccountsInfo({ limit: 5, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(5);
		result.data.forEach(account => expect(account).toMap(topLSKAddressSchema));
		if (result.data.length > 1) {
			for (let i = 1; i < result.data.length; i++) {
				const prevAccount = result.data[i - 1];
				const currAccount = result.data[i];
				expect(BigInt(prevAccount.balance)).toBeGreaterThanOrEqual(BigInt(currAccount.balance));
			}
		}
		expect(result.meta).toMap(topLSKAddressMetaSchema);
	});

	it('returns lisk top accounts list with limit=5, offset=1 & sort=balance:asc', async () => {
		const response = await getTopAccountsInfo({ limit: 5, offset: 1, sort: 'balance:asc' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(account => expect(account).toMap(topLSKAddressSchema));
		if (result.data.length > 1) {
			for (let i = 1; i < result.data.length; i++) {
				const prevAccount = result.data[i - 1];
				const currAccount = result.data[i];
				expect(BigInt(prevAccount.balance)).toBeLessThanOrEqual(BigInt(currAccount.balance));
			}
		}
		expect(result.meta).toMap(topLSKAddressMetaSchema);
	});

	it('No address with tokenID -> invalid param', async () => {
		const response = await getTopAccountsInfo({ tokenID: '' });
		expect(response).toMap(invalidParamsSchema);
	});
});
