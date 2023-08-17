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
} = require('../../../schemas/api_v3/posClaimableRewards.schema');
const { invalidAddresses, invalidNames, invalidPublicKeys, invalidLimits, invalidOffsets } = require('../constants/invalidInputs');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getPosClaimableRewards = async (params) => request(wsRpcUrl, 'get.pos.rewards.claimable', params);
const getGenerators = async () => request(wsRpcUrl, 'get.generators');

describe('Claimable rewards API', () => {
	let refGenerator;
	beforeAll(async () => {
		do {
			// eslint-disable-next-line no-await-in-loop
			const { result } = await getGenerators();
			if (result.data.length) {
				[refGenerator] = result.data;
			}
		} while (!refGenerator);
	});

	it('should return list of claimable rewards for known validator name', async () => {
		const response = await getPosClaimableRewards({ name: refGenerator.name });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of claimable rewards with known validator name and offset=1', async () => {
		const response = await getPosClaimableRewards({ name: refGenerator.name, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of claimable rewards with known validator name and limit=5', async () => {
		const response = await getPosClaimableRewards({ name: refGenerator.name, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(5);
	});

	it('should return list of claimable rewards with known validator name, offset=1 and limit=5', async () => {
		const response = await getPosClaimableRewards({ name: refGenerator.name, offset: 1, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(5);
	});

	it('should return list of claimable rewards with known validator address', async () => {
		const response = await getPosClaimableRewards({ address: refGenerator.address });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of of claimable rewards with known validator address and offset=1', async () => {
		const response = await getPosClaimableRewards({ address: refGenerator.address, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of claimable rewards with known validator address and limit=5', async () => {
		const response = await getPosClaimableRewards({ address: refGenerator.address, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(5);
	});

	it('should return list of claimable rewards with known validator address, offset=1 and limit=5', async () => {
		const response = await getPosClaimableRewards({
			address: refGenerator.address, offset: 1, limit: 5,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(5);
	});

	it('should return list of claimable rewards with known validator publicKey', async () => {
		const response = await getPosClaimableRewards({ publicKey: refGenerator.publicKey });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of of claimable rewards with known validator publicKey and offset=1', async () => {
		if (refGenerator.publicKey) {
			const response = await getPosClaimableRewards({
				publicKey: refGenerator.publicKey, offset: 1,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(goodResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
		}
	});

	it('should return list of claimable rewards with known validator publicKey and limit=5', async () => {
		if (refGenerator.publicKey) {
			const response = await getPosClaimableRewards({
				publicKey: refGenerator.publicKey, limit: 5,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(goodResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(5);
		}
	});

	it('should return list of claimable rewards with known validator publicKey, offset=1 and limit=5', async () => {
		if (refGenerator.publicKey) {
			const response = await getPosClaimableRewards({
				publicKey: refGenerator.publicKey, offset: 1, limit: 5,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(goodResponseSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(5);
		}
	});

	it('should return invalid params if requested without any param', async () => {
		const response = await getPosClaimableRewards();
		expect(response).toMap(invalidRequestSchema);
	});

	it('should return invalid params if requested with invalid address', async () => {
		for (let i = 0; i < invalidAddresses.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getPosClaimableRewards({ address: invalidAddresses[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params if requested with invalid name', async () => {
		for (let i = 0; i < invalidNames.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getPosClaimableRewards({ name: invalidNames[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params if requested with invalid publicKey', async () => {
		for (let i = 0; i < invalidPublicKeys.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getPosClaimableRewards({ publicKey: invalidPublicKeys[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params if requested with invalid limit', async () => {
		for (let i = 0; i < invalidLimits.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getPosClaimableRewards({
				address: refGenerator.address,
				limit: invalidLimits[i],
			});
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params if requested with invalid offset', async () => {
		for (let i = 0; i < invalidOffsets.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getPosClaimableRewards({
				address: refGenerator.address,
				offset: invalidOffsets[i],
			});
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params if requested with invalid param', async () => {
		const response = await getPosClaimableRewards({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params if requested with empty invalid param', async () => {
		const response = await getPosClaimableRewards({ invalidParam: '' });
		expect(response).toMap(invalidParamsSchema);
	});
});
