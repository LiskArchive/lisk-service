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
	stakeResponseSchema,
} = require('../../../schemas/api_v3/stake.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getStakes = async (params) => request(wsRpcUrl, 'get.pos.stakes', params);

describe('get.pos.stakes', () => {
	let refValidator;
	beforeAll(async () => {
		do {
			// eslint-disable-next-line no-await-in-loop
			const response = await request(wsRpcUrl, 'get.transactions', { moduleCommand: 'pos:stake', limit: 1 });
			const { data: [stakeTx] = [] } = response.result;
			if (stakeTx) {
				refValidator = stakeTx.sender;
			}
		} while (!refValidator);
	});

	it('Returns list of sent stakes when requested for known staker address', async () => {
		const response = await getStakes({ address: refValidator.address });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakeResponseSchema);
		expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakes.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of sent stakes when requested for known staker name', async () => {
		const response = await getStakes({ name: refValidator.name });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakeResponseSchema);
		expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakes.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of sent stakes when requested for known staker publicKey', async () => {
		const response = await getStakes({ publicKey: refValidator.publicKey });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakeResponseSchema);
		expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakes.length).toBeLessThanOrEqual(10);
	});

	it('No address -> invalid param', async () => {
		const response = await getStakes();
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid request param -> invalid param', async () => {
		const response = await getStakes({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid address -> invalid param', async () => {
		const response = await getStakes({ address: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});
});
