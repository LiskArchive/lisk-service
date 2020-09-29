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
import to from 'await-to-js';

import { api } from '../../helpers/socketIoRpcRequest';
import { JSON_RPC } from '../../helpers/errorCodes';
import { badRequestSchema, goodRequestSchema } from '../../helpers/schemas';

const votersSchema = Joi.array().items(Joi.object({
	address: Joi.string(),
	balance: Joi.string(),
	publicKey: Joi.string(),
	username: Joi.string(),
}).required()).required();

const getVoters = async params => api.getJsonRpcV1('get.voters', params);

describe('get.voters', () => {
	[
		['returns voters for existing account by delegate address', { address: '2581762640681118072L' }],
		['returns voters for existing account by delegate username', { username: 'genesis_51' }],
		['returns voters for existing account by delegate public key', { publickey: '01389197bbaf1afb0acd47bbfeabb34aca80fb372a8f694a1c0716b3398db746' }],
		// TODO Fix this test case. There is no account with voters and second public key on the
		// blockchain snapshot currently used in Jenkins.
		// ['returns voters for existing account by delegate second public key',
		// { secpubkey: 'ec057d8816b18b83a2baac387eebf8af707f8fb565c963476a0e4533e8481eaf' }],
	]
		.forEach(([name, body]) => {
			it(name, async () => {
				const result = await getVoters(body);
				expect(result.data).toMap(votersSchema);
			});
		});

	it('returns voters when called with an address', async () => {
		const result = await getVoters({ address: '9528507096611161860L' });
		expect(result).toMap(goodRequestSchema);
		expect(result.data).toMap(votersSchema);
	});

	it('returns empty response when called with unused address', async () => {
		const result = await getVoters({ address: '999999999L' });
		expect(result).toEqual({});
	});

	it('returns INVALID_PARAMS error (-32602) when called with invalid address', async () => {
		const [error] = await to(getVoters({ address: 999999999999999 }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	it('returns INVALID_PARAMS error (-32602) when called with account_id param', async () => {
		const [error] = await to(getVoters({ account_id: '999999999L' }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});
});
