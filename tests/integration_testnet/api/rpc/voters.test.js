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

import {
	envelopeSchema,
	emptyEnvelopeSchema,
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
} from './schemas/generics.schema';

import request from '../../helpers/socketIoRpcRequest';
import config from '../../config';

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;

const votersSchema = Joi.array().items(Joi.object({
	address: Joi.string(),
	balance: Joi.string(),
	publicKey: Joi.string(),
	username: Joi.string(),
}).required()).required();

const getVoters = async params => request(wsRpcUrl, 'get.votes_received', params);

describe('get.voters', () => {
	[
		['returns voters for existing account by delegate address', { address: '5201600508578320196L' }],
		['returns voters for existing account by delegate username', { username: 'cc001' }],
		['returns voters for existing account by delegate public key', { publickey: '473c354cdf627b82e9113e02a337486dd3afc5615eb71ffd311c5a0beda37b8c' }],
		// TODO Fix this test case. There is no account with voters and second public key on the
		// blockchain snapshot currently used in Jenkins.
		// ['returns voters for existing account by delegate second public key',
		// { secpubkey: 'ec057d8816b18b83a2baac387eebf8af707f8fb565c963476a0e4533e8481eaf' }],
	]
		.forEach(([name, body]) => {
			it(name, async () => {
				const response = await getVoters(body);
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result).toMap(envelopeSchema);
				expect(result.data).toMap(votersSchema);
			});
		});

	it('returns empty response when called with unused address', async () => {
		const response = await getVoters({ address: '999999999L' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		expect(response.result).toMap(emptyEnvelopeSchema);
	});

	it('returns INVALID_PARAMS error (-32602) when called with invalid address', async () => {
		const response = await getVoters({ address: 999999999999999 });
		expect(response).toMap(invalidParamsSchema);
	});

	it('returns INVALID_PARAMS error (-32602) when called with account_id param', async () => {
		const response = await getVoters({ account_id: '999999999L' });
		expect(response).toMap(invalidParamsSchema);
	});
});
