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
import config from '../../config';
import request from '../../helpers/socketIoRpcRequest';
import accounts from './constants/accounts';

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;

const {
	invalidParamsSchema,
	emptyResultEnvelopeSchema,
	emptyResponseSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../schemas/rpcGenerics.schema');

const {
	accountSchema,
	delegateSchema,
} = require('../../schemas/account.schema');

const getAccounts = async params => request(wsRpcUrl, 'get.accounts', params);

describe('Method get.accounts', () => {
	describe('is able to retrieve account lists', () => {
		it('returns account details with no params', async () => {
			const response = await getAccounts({});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data.length).toEqual(10);
			result.data.forEach(account => expect(account).toMap(accountSchema));
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('is able to retrieve account based on address', () => {
		it('returns account details on known address', async () => {
			const response = await getAccounts({ address: accounts.genesis.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data.length).toEqual(1);
			result.data.forEach(account => expect(account)
				.toMap(accountSchema, { address: accounts.genesis.address }));
			expect(result.meta).toMap(metaSchema);
		});

		it('returns account details when known address is written lowercase', async () => {
			const response = await getAccounts({ address: accounts.genesis.address.toLowerCase() });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data.length).toEqual(1);
			result.data.forEach(account => expect(account)
				.toMap(accountSchema, { address: accounts.genesis.address }));
			expect(result.meta).toMap(metaSchema);
		});

		it('returns empty response when unknown address', async () => {
			const response = await getAccounts({ address: '99999L' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('returns INVALID_PARAMS error (-32602) on invalid address', async () => {
			const response = await getAccounts({ address: 'L' }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		});

		xit('returns empty response when given empty address', async () => {
			const response = await getAccounts({ address: '' }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retrieve account based on public key', () => {
		it('returns account details on known public key', async () => {
			const response = await getAccounts({ publickey: accounts.genesis.publicKey });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data.length).toEqual(1);
			result.data.forEach(account => expect(account)
				.toMap(accountSchema, { address: accounts.genesis.address }));
			expect(result.meta).toMap(metaSchema);
		});

		xit('returns empty response on invalid public key', async () => {
			const response = await getAccounts({ address: '' }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
			const { error } = response;
			expect(error).toMap(invalidParamsSchema);
		});

		it('returns empty response on unknown public key', async () => {
			const response = await getAccounts({ publickey: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		xit('throws INVALID_PARAMS error (-32602) on empty public key', async () => {
			const { error } = await getAccounts({ publickey: '' }).catch(e => e);
			expect(error).toMap(invalidParamsSchema);
		});
	});

	xdescribe('is able to retrieve account based on second public key', () => {
		it('returns account details on known second public key', async () => {
			const { result } = await getAccounts({
				secpubkey: accounts['second passphrase account'].secondPublicKey,
			});
			expect(result.data.length).toEqual(1);
			expect(result.data[0]).toMap(accountSchema, {
				address: accounts['second passphrase account'].address,
			});
		});
	});

	describe('is able to retrieve delegate account details', () => {
		it('returns delegate data by address', async () => {
			const response = await getAccounts({ address: accounts.delegate.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data.length).toEqual(1);
			result.data.forEach(account => {
				expect(account).toMap(accountSchema, { address: accounts.delegate.address });
				expect(account.delegate).toMap(delegateSchema);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns delegate data by delegate name', async () => {
			const response = await getAccounts({ username: accounts.delegate.delegate.username });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data.length).toEqual(1);
			result.data.forEach(account => {
				expect(account).toMap(accountSchema, { address: accounts.delegate.address });
				expect(account.delegate).toMap(delegateSchema);
			});
			expect(result.meta).toMap(metaSchema);
		});
	});
});
