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
import Joi from '@hapi/joi';
import to from 'await-to-js';

import { api } from '../../helpers/socketIoRpcRequest';
import { JSON_RPC } from '../../helpers/errorCodes';
import { badRequestSchema, goodRequestSchema } from '../../helpers/schemas';

const votesSchema = Joi.array().items(Joi.object({
	address: Joi.string(),
	balance: Joi.string(),
	publicKey: Joi.string(),
	username: Joi.string(),
}).required()).required();

const getVotes = async params => api.getJsonRpcV1('get.votes', params);

describe('Method get.votes', () => {
	[
		['returns votes for existing account by address', { address: '16313739661670634666L' }],
		['returns votes for existing account by username', { username: 'gottavoteemall' }],
		['returns votes for existing account by public key', { publickey: 'd258627878a9b360fe4934218d2415d66b1ed2ef63ce097280bf02189a91468d' }],
		// TODO Fix this test case. There is no account with votes and second public key on the
		// blockchain snapshot currently used in Jenkins.
		// ['returns votes for existing account by second public key',
		// { secpubkey: 'ec057d8816b18b83a2baac387eebf8af707f8fb565c963476a0e4533e8481eaf' }],
	]
		.forEach(([name, body, length = 10]) => {
			it(name, async () => {
				const result = await getVotes(body);
				expect(result.data).toMap(votesSchema.length(length));
			});
		});

	it('returns voters when called with an address', async () => {
		const result = await getVotes({ address: '16313739661670634666L' });
		expect(result).toMap(goodRequestSchema);
		expect(result.data).toMap(votesSchema);
	});

	it('returns empty response when called with unused address', async () => {
		const result = await getVotes({ address: '999999999L' });
		expect(result).toEqual({});
	});

	it('returns INVALID_PARAMS error (-32602) when called with invalid address', async () => {
		const [error] = await to(getVotes({ address: 999999999999999 }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	it('returns INVALID_PARAMS error (-32602) when called with account_id param', async () => {
		const [error] = await to(getVotes({ account_id: '999999999L' }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});
});
