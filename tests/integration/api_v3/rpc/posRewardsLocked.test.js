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
	jsonRpcEnvelopeSchema,
	invalidParamsSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	goodResponseSchema,
} = require('../../../schemas/api_v3/posRewardsLocked.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getPoSRewardsLocked = async (params) => request(wsRpcUrl, 'get.pos.rewards.locked', params);

describe('Rewards Locked API', () => {
	it('Returns list locked rewards with name parameter', async () => {
		const response = await getPoSRewardsLocked({ name: 'test' });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('Returns list locked rewards with address parameter', async () => {
		const response = await getPoSRewardsLocked({ address: 'lskaeec6426y8mkoq4oqgf5g4fsau738gb697pj8q' });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('Returns list locked rewards with name publickKey', async () => {
		const response = await getPoSRewardsLocked({ publicKey: '9bae3da048d24db845f02772ced2791e0b269063ac2c3e30010ed6623726dbc4' });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('No param -> bad request', async () => {
		const response = await getPoSRewardsLocked({});
		expect(response).toMap(invalidParamsSchema);
	});

	it('invalid address -> bad request', async () => {
		const response = await getPoSRewardsLocked({ address: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('invalid name -> bad name', async () => {
		const response = await getPoSRewardsLocked({ name: '#' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('invalid request param -> bad request', async () => {
		const response = await getPoSRewardsLocked({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
