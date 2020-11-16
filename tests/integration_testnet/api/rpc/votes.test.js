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
import request from '../../helpers/socketIoRpcRequest';
import config from '../../config';

// Schemas
const {
	resultEnvelopeSchema,
	emptyResultEnvelopeSchema,
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
} = require('../../schemas/generics.schema');

const { goodRequestSchema } = require('../../helpers/schemas/general');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;

const votesSchema = Joi.array().items(Joi.object({
	address: Joi.string().required(),
	amount: Joi.string().optional(),
	balance: Joi.string().required(),
	publicKey: Joi.string().required(),
	username: Joi.string(),
}).required()).required();

const getVotes = async params => request(wsRpcUrl, 'get.votes_sent', params);

describe('Method get.votes', () => {
	[
		['returns votes for existing account by address', { address: '16313739661670634666L' }],
		['returns votes for existing account by username', { username: 'cc001' }],
		['returns votes for existing account by public key', { publickey: '473c354cdf627b82e9113e02a337486dd3afc5615eb71ffd311c5a0beda37b8c' }],
		// TODO Fix this test case. There is no account with votes and second public key on the
		// blockchain snapshot currently used in Jenkins.
		// ['returns votes for existing account by second public key',
		// { secpubkey: 'ec057d8816b18b83a2baac387eebf8af707f8fb565c963476a0e4533e8481eaf' }],
	]
		.forEach(([name, body]) => {
			it(name, async () => {
				const response = await getVotes(body);
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result).toMap(resultEnvelopeSchema);
				expect(result.data).toMap(votesSchema);
			});
		});

	it('returns voters when called with an address', async () => {
		const result = await getVotes({ address: '16313739661670634666L' });
		expect(result.result).toMap(goodRequestSchema);
	});

	it('returns empty response when called with unused address', async () => {
		const response = await getVotes({ address: '999999999L' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		expect(response.result).toMap(emptyResultEnvelopeSchema);
	});

	it('returns INVALID_PARAMS error (-32602) when called with invalid address', async () => {
		const response = await getVotes({ address: 999999999999999 });
		expect(response).toMap(invalidParamsSchema);
	});

	it('returns INVALID_PARAMS error (-32602) when called with account_id param', async () => {
		const response = await getVotes({ account_id: '999999999L' });
		expect(response).toMap(invalidParamsSchema);
	});
});
