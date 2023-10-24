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
	invalidRequestSchema,
} = require('../../../schemas/rpcGenerics.schema');

const { stakesResponseSchema } = require('../../../schemas/api_v3/stakes.schema');
const {
	invalidPublicKeys,
	invalidAddresses,
	invalidPartialSearches,
	invalidNames,
} = require('../constants/invalidInputs');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getStakes = async params => request(wsRpcUrl, 'get.pos.stakes', params);

describe('get.pos.stakes', () => {
	let refStaker;
	let refValidator;
	let maxNumberSentStakes;
	beforeAll(async () => {
		let refValidatorAddress;
		const posConstants = (await request(wsRpcUrl, 'get.pos.constants')).result;
		maxNumberSentStakes = posConstants.data.maxNumberSentStakes;

		do {
			const response = await request(wsRpcUrl, 'get.transactions', {
				moduleCommand: 'pos:stake',
				limit: 1,
			});
			const { data: [stakeTx] = [] } = response.result;
			if (stakeTx) {
				const {
					params: {
						stakes: [stake],
					},
				} = stakeTx;
				refValidatorAddress = stake.validatorAddress;
				refStaker = stakeTx.sender;
			}
		} while (!refStaker);
		const validatorsResponse = await request(wsRpcUrl, 'get.pos.validators', {
			address: refValidatorAddress,
		});
		[refValidator] = validatorsResponse.result.data;
	});

	it('should return list of stakes when requested for known staker address', async () => {
		const response = await getStakes({ address: refStaker.address });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakesResponseSchema);
		expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
	});

	it('should return list of stakes when requested for known staker address and search (exact validator name) param', async () => {
		const response = await getStakes({ address: refStaker.address, search: refValidator.name });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakesResponseSchema);
		expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
		expect(result.data.stakes[0].address).toBe(refValidator.address);
	});

	it('should return list of stakes when requested for known staker address and search (exact validator address) param', async () => {
		const response = await getStakes({ address: refStaker.address, search: refValidator.address });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakesResponseSchema);
		expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
		expect(result.data.stakes[0].address).toBe(refValidator.address);
	});

	it('should return list of stakes when requested for known staker address and search (exact validator public key) param', async () => {
		const response = await getStakes({
			address: refStaker.address,
			search: refValidator.publicKey,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakesResponseSchema);
		expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
		expect(result.data.stakes[0].address).toBe(refValidator.address);
	});

	it('should return list of stakes when requested for known staker address and search (partial validator name) param', async () => {
		const searchParam = refValidator.name ? refValidator.name.substring(0, 3) : '';
		const response = await getStakes({ address: refStaker.address, search: searchParam });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakesResponseSchema);
		expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
		expect(result.data.stakes.some(staker => staker.address === refValidator.address)).toBe(true);
	});

	it('should return list of stakes when requested for known staker address and search (partial validator address) param', async () => {
		const searchParam = refValidator.address ? refValidator.address.substring(0, 3) : '';
		const response = await getStakes({ address: refStaker.address, search: searchParam });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakesResponseSchema);
		expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
		expect(result.data.stakes.some(staker => staker.address === refValidator.address)).toBe(true);
	});

	it('should return list of stakes when requested for known staker address and search (partial validator public key) param', async () => {
		const searchParam = refValidator.publicKey ? refValidator.publicKey.substring(0, 3) : '';
		const response = await getStakes({ address: refStaker.address, search: searchParam });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakesResponseSchema);
		expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
		expect(result.data.stakes.some(staker => staker.address === refValidator.address)).toBe(true);
	});

	it('should return list of stakes when requested for known staker name', async () => {
		if (refStaker.name) {
			const response = await getStakes({ name: refStaker.name });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(stakesResponseSchema);
			expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
			expect(result.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
		}
	});

	it('should return list of stakes when requested for known staker publicKey', async () => {
		const response = await getStakes({ publicKey: refStaker.publicKey });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakesResponseSchema);
		expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
	});

	it('should return invalid params if address, publicKey and name is missing', async () => {
		const response = await getStakes();
		expect(response).toMap(invalidRequestSchema);
	});

	it('should return invalid params for invalid address', async () => {
		for (let i = 0; i < invalidAddresses.length; i++) {
			const response = await getStakes({ address: invalidAddresses[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for invalid publicKey', async () => {
		for (let i = 0; i < invalidPublicKeys.length; i++) {
			const response = await getStakes({ publicKey: invalidPublicKeys[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for invalid name', async () => {
		for (let i = 0; i < invalidNames.length; i++) {
			const response = await getStakes({ name: invalidNames[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for invalid search', async () => {
		for (let i = 0; i < invalidPartialSearches.length; i++) {
			const response = await getStakes({
				address: refStaker.address,
				search: invalidPartialSearches[i],
			});
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for invalid param', async () => {
		const response = await getStakes({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params for empty param', async () => {
		const response = await getStakes({ invalidParam: '' });
		expect(response).toMap(invalidParamsSchema);
	});
});
