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
import Joi from 'joi';
import config from '../../config';
import request from '../../helpers/socketIoRpcRequest';
import { JSON_RPC } from '../../helpers/errorCodes';
import accounts from './constants/accounts';
import {
	invalidParamsSchema,
	emptyEnvelopeSchema,
	jsonRpcEnvelopeSchema,
} from './schemas/generics.schema';

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;

const accountSchema = Joi.object({
	address: Joi.string().required(),
	publicKey: Joi.string().required(),
	secondPublicKey: Joi.string().allow('').required(),
	balance: Joi.string().required(),
	delegate: Joi.object(),
	knowledge: Joi.object(),
	multisignatureAccount: Joi.object(),
	transactionCount: Joi.object(),
});

const delegateSchema = Joi.object({
	approval: Joi.number(),
	missedBlocks: Joi.number(),
	producedBlocks: Joi.number(),
	productivity: Joi.string(),
	rank: Joi.number(),
	username: Joi.string(),
	vote: Joi.string(),
	rewards: Joi.string(),
}).required();

const getAccounts = async params => request(wsRpcUrl, 'get.accounts', params);

describe('Method get.accounts', () => {
	describe('is able to retrieve account lists', () => {
		it.todo('returns account details with no params');
	});

	describe('is able to retrieve account based on address', () => {
		it('returns account details on known address', async () => {
			const { result } = await getAccounts({ address: accounts.genesis.address });
			expect(result.data.length).toEqual(1);
			expect(result.data[0]).toMap(accountSchema, { address: accounts.genesis.address });
		});

		it('returns account details when known address is written lowercase', async () => {
			const { result } = await getAccounts({ address: accounts.genesis.address.toLowerCase() });
			expect(result.data.length).toEqual(1);
			expect(result.data[0]).toMap(accountSchema, { address: accounts.genesis.address });
		});

		it('returns empty response when unknown address', async () => {
			const result = await getAccounts({ address: '99999L' });
			expect(result).toMap(jsonRpcEnvelopeSchema);
			expect(result.result).toMap(emptyEnvelopeSchema);
		});

		it('returns INVALID_PARAMS error (-32602) on invalid address', async () => {
			const { result } = await getAccounts({ address: 'L' }).catch(e => e);
			expect(result).toMap(invalidParamsSchema);
		});

		it('returns empty response when given empty address', async () => {
			const { error } = await getAccounts({ address: '' }).catch(e => e);
			expect(error).toMap(invalidParamsSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
		});
	});

	describe('is able to retrieve account based on public key', () => {
		it('returns account details on known public key', async () => {
			const { result } = await getAccounts({ publickey: accounts.genesis.publicKey });
			expect(result.data.length).toEqual(1);
			expect(result.data[0]).toMap(accountSchema, { address: accounts.genesis.address });
		});

		it('returns empty response on invalid public key', async () => {
			const { error } = await getAccounts({ address: '' }).catch(e => e);
			expect(error).toMap(invalidParamsSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
		});

		it('returns empty response on unknown public key', async () => {
			const { result } = await getAccounts({ publickey: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' });
			expect(result).toMap(emptyEnvelopeSchema);
		});

		it('throws INVALID_PARAMS error (-32602) on empty public key', async () => {
			const { error } = await getAccounts({ publickey: '' }).catch(e => e);
			expect(error).toMap(invalidParamsSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
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
			const { result } = await getAccounts({ address: accounts.delegate.address }).catch(e => e);
			expect(result.data[0].delegate).toMap(delegateSchema);
		});

		xit('returns delegate data by delegate name', async () => {
			const { result } = await getAccounts({ username: accounts.delegate.username });
			expect(result.data[0].delegate).toMap(delegateSchema);
		});
	});
});
