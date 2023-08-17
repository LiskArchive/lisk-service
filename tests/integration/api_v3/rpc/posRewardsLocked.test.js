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
	invalidRequestSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	goodResponseSchema,
} = require('../../../schemas/api_v3/posRewardsLocked.schema');
const { invalidPublicKeys, invalidNames, invalidAddresses, invalidLimits, invalidOffsets } = require('../constants/invalidInputs');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getPosRewardsLocked = async (params) => request(wsRpcUrl, 'get.pos.rewards.locked', params);
const getTransaction = async params => request(wsRpcUrl, 'get.transactions', params);
const getStakes = async (params) => request(wsRpcUrl, 'get.pos.stakes', params);

describe('Rewards Locked API', () => {
	let refStaker;
	beforeAll(async () => {
		let refStakerAddress;
		const stakeTransactionReponse = await getTransaction({ moduleCommand: 'pos:stake', limit: 1 });
		const { data: stakeTxs = [] } = stakeTransactionReponse.result;
		if (stakeTxs.length) {
			refStakerAddress = stakeTxs[0].sender.address;
		}
		const response2 = await getStakes({ address: refStakerAddress });
		refStaker = response2.result.meta.staker;
	});

	it('should return list of locked rewards with name parameter', async () => {
		const response = await getPosRewardsLocked({ name: refStaker.name });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of locked rewards with name and limit=5', async () => {
		const response = await getPosRewardsLocked({ name: refStaker.name, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(5);
	});

	it('should return list of locked rewards with name and offset=1', async () => {
		const response = await getPosRewardsLocked({ name: refStaker.name, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of locked rewards with name, limit=5 and offset=1', async () => {
		const response = await getPosRewardsLocked({ name: refStaker.name, limit: 5, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(5);
	});

	it('should return list of locked rewards with address parameter', async () => {
		const response = await getPosRewardsLocked({ address: refStaker.address });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of locked rewards with address and limit=5', async () => {
		const response = await getPosRewardsLocked({ address: refStaker.address, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(5);
	});

	it('should return list of locked rewards with address and offset=1', async () => {
		const response = await getPosRewardsLocked({ address: refStaker.address, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of locked rewards with address, limit=5 and offset=1', async () => {
		const response = await getPosRewardsLocked({ address: refStaker.address, limit: 5, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(5);
	});

	it('should return list of locked rewards with publicKey', async () => {
		if (refStaker.publicKey) {
			const response = await getPosRewardsLocked({ publicKey: refStaker.publicKey });
			expect(response).toMap(jsonRpcEnvelopeSchema);

			const { result } = response;
			expect(result).toMap(goodResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
		}
	});

	it('should return list of locked rewards with publicKey and limit=5', async () => {
		if (refStaker.publicKey) {
			const response = await getPosRewardsLocked({ publicKey: refStaker.publicKey, limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);

			const { result } = response;
			expect(result).toMap(goodResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
		}
	});

	it('should return list of locked rewards with publicKey and offset=1', async () => {
		if (refStaker.publicKey) {
			const response = await getPosRewardsLocked({ publicKey: refStaker.publicKey, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);

			const { result } = response;
			expect(result).toMap(goodResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
		}
	});

	it('should return list of locked rewards with publicKey, limit=5 and offset=1', async () => {
		if (refStaker.publicKey) {
			const response = await getPosRewardsLocked({
				publicKey: refStaker.publicKey,
				limit: 5,
				offset: 1,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);

			const { result } = response;
			expect(result).toMap(goodResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(5);
		}
	});

	it('should return invalid params if requested without any param', async () => {
		const response = await getPosRewardsLocked();
		expect(response).toMap(invalidRequestSchema);
	});

	it('should return invalid params if requested with invalid address', async () => {
		for (let i = 0; i < invalidAddresses.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getPosRewardsLocked({ address: invalidAddresses[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params if requested with invalid name', async () => {
		for (let i = 0; i < invalidNames.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getPosRewardsLocked({ name: invalidNames[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params if requested with invalid publicKey', async () => {
		for (let i = 0; i < invalidPublicKeys.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getPosRewardsLocked({ publicKey: invalidPublicKeys[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params if requested with invalid limit', async () => {
		for (let i = 0; i < invalidLimits.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getPosRewardsLocked({
				address: refStaker.address,
				limit: invalidLimits[i],
			});
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params if requested with invalid offset', async () => {
		for (let i = 0; i < invalidOffsets.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getPosRewardsLocked({
				address: refStaker.address,
				offset: invalidOffsets[i],
			});
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params if requested with invalid param', async () => {
		const response = await getPosRewardsLocked({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params if requested with empty invalid param', async () => {
		const response = await getPosRewardsLocked({ invalidParam: '' });
		expect(response).toMap(invalidParamsSchema);
	});
});
