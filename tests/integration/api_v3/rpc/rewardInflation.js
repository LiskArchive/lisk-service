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
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	rewardInflationResponseSchema,
} = require('../../../schemas/api_v3/reward.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getRewardDefault = async () => request(wsRpcUrl, 'get.reward.inflation');

describe('get.reward.default', () => {
	it('Returns current inflation rate', async () => {
		const response = await getRewardDefault({ height: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(rewardInflationResponseSchema);
	});

	it('Invalid request param -> invalid param', async () => {
		const response = await getRewardDefault({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
