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

const { rewardInflationResponseSchema } = require('../../../schemas/api_v3/rewardInflation.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getRewardInflation = async params => request(wsRpcUrl, 'get.reward.annual-inflation', params);

let latestBlockHeight;

describe('Test get.reward.annual-inflation', () => {
	beforeAll(async () => {
		const response = await request(wsRpcUrl, 'get.network.status');
		latestBlockHeight = response.result.data.height;
	});

	it('should return current inflation rate when called with latest block height', async () => {
		const response = await getRewardInflation({ height: latestBlockHeight });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(rewardInflationResponseSchema);
	});

	it('should return invalid params for missing height', async () => {
		const response = await getRewardInflation();
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params for a height less than 0', async () => {
		const response = await getRewardInflation({ height: -1 });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params for a non-integer height', async () => {
		const response = await getRewardInflation({ height: 'abc' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params for a invalid param', async () => {
		const response = await getRewardInflation({ invalidParam: 'invalidParam' });
		expect(response).toMap(invalidParamsSchema);
	});
});
