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
} = require('../../../schemas/api_v3/posClaimableRewards.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getPosClaimableRewards = async (params) => request(wsRpcUrl, 'get.pos.rewards.claimable', params);
const getGenerators = async () => request(wsRpcUrl, 'get.generators');

describe('Claimable rewards API', () => {
	let refValidator;
	beforeAll(async () => {
		do {
			// eslint-disable-next-line no-await-in-loop
			const generators = await getGenerators();
			if (generators.data.length) {
				[refValidator] = generators.data;
			}
		} while (!refValidator);
	});

	it('Returns list of claimable rewards for known validator name', async () => {
		const response = await getPosClaimableRewards({ name: refValidator.name });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of claimable rewards with known validator name and offset=1', async () => {
		const response = await getPosClaimableRewards({ name: refValidator.name, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of claimable rewards with known validator name and limit=5', async () => {
		const response = await getPosClaimableRewards({ name: refValidator.name, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(5);
	});

	it('Returns list of claimable rewards with known validator name, offset=1 and limit=5', async () => {
		const response = await getPosClaimableRewards({ name: refValidator.name, offset: 1, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(5);
	});

	it('Returns list of claimable rewards with known validator address', async () => {
		const response = await getPosClaimableRewards({ address: refValidator.address });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of of claimable rewards with known validator address and offset=1', async () => {
		const response = await getPosClaimableRewards({ address: refValidator.address, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of claimable rewards with known validator address and limit=5', async () => {
		const response = await getPosClaimableRewards({ address: refValidator.address, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(5);
	});

	it('Returns list of claimable rewards with known validator address, offset=1 and limit=5', async () => {
		const response = await getPosClaimableRewards({
			address: refValidator.address, offset: 1, limit: 5,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(5);
	});

	it('Returns list of claimable rewards with known validator publicKey', async () => {
		const response = await getPosClaimableRewards({ publicKey: refValidator.publicKey });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of of claimable rewards with known validator publicKey and offset=1', async () => {
		const response = await getPosClaimableRewards({
			publicKey: refValidator.publicKey, offset: 1,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of claimable rewards with known validator publicKey and limit=5', async () => {
		const response = await getPosClaimableRewards({
			publicKey: refValidator.publicKey, limit: 5,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(5);
	});

	it('Returns list of claimable rewards with known validator publicKey, offset=1 and limit=5', async () => {
		const response = await getPosClaimableRewards({
			publicKey: refValidator.publicKey, offset: 1, limit: 5,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(5);
	});

	it('No param -> bad request', async () => {
		const response = await getPosClaimableRewards();
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid address -> bad request', async () => {
		const response = await getPosClaimableRewards({ address: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid name -> bad request', async () => {
		const response = await getPosClaimableRewards({ name: '#' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid publicKey -> bad request', async () => {
		const response = await getPosClaimableRewards({ publicKey: '412875216073141752800000' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid request param -> bad request', async () => {
		const response = await getPosClaimableRewards({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
