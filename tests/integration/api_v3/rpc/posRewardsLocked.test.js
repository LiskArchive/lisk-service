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

const getPosRewardsLocked = async (params) => request(wsRpcUrl, 'get.pos.rewards.locked', params);
const getStakeTransaction = async params => request(wsRpcUrl, 'get.transactions', params);
const getStakes = async (params) => request(wsRpcUrl, 'get.pos.stakes', params);

describe('Rewards Locked API', () => {
	let refAccount;
	beforeAll(async () => {
		let refValidatorAddress;
		const stakeTransactionReponse = await getStakeTransaction({ moduleCommand: 'pos:stake', limit: 1 });
		const { stakeTx = [] } = stakeTransactionReponse.data;
		if (stakeTx) {
			refValidatorAddress = stakeTx.sender.address;
		}
		const response2 = await getStakes({ address: refValidatorAddress });
		refAccount = response2.data[0].account;
	});
	it('Returns list of locked rewards with name parameter', async () => {
		const response = await getPosRewardsLocked({ name: refAccount.name });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('Returns list locked rewards with address parameter', async () => {
		const response = await getPosRewardsLocked({ address: refAccount.address });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('Returns list locked rewards with publickKey', async () => {
		const response = await getPosRewardsLocked({ publicKey: refAccount.publicKey });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('No param -> bad request', async () => {
		const response = await getPosRewardsLocked({});
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid address -> bad request', async () => {
		const response = await getPosRewardsLocked({ address: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid name -> bad request', async () => {
		const response = await getPosRewardsLocked({ name: '#' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid request param -> bad request', async () => {
		const response = await getPosRewardsLocked({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
