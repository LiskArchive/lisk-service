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

const { rewardConstantsResponseSchema } = require('../../../schemas/api_v3/rewardConstants.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getRewardConstants = async params => request(wsRpcUrl, 'get.reward.constants', params);

describe('get.reward.constants', () => {
	it('should return reward constants when requested', async () => {
		const response = await getRewardConstants({});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(rewardConstantsResponseSchema);
	});

	it('should return invalid params when requested with invalid param', async () => {
		const response = await getRewardConstants({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params when requested with empty invalid param', async () => {
		const response = await getRewardConstants({ invalidParam: '' });
		expect(response).toMap(invalidParamsSchema);
	});
});
