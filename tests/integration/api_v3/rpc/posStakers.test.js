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
	invalidRequestSchema,
	jsonRpcEnvelopeSchema,
} = require('../../../schemas/rpcGenerics.schema');
const { goodRequestSchema } = require('../../../schemas/api_v3/staker.schema');
const {
	invalidNames,
	invalidPublicKeys,
	invalidAddresses,
	invalidPartialSearches,
	invalidLimits,
	invalidOffsets,
} = require('../constants/invalidInputs');
const { waitMs } = require('../../../helpers/utils');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getStakers = async params => request(wsRpcUrl, 'get.pos.stakers', params);

describe('get.pos.stakers', () => {
	let refValidator;
	let refStaker;

	beforeAll(async () => {
		let refValidatorAddress;
		let retries = 10;
		let success = false;

		do {
			const response1 = await request(wsRpcUrl, 'get.transactions', {
				moduleCommand: 'pos:stake',
				limit: 1,
			});
			const { data: [stakeTx] = [] } = response1.result;
			if (stakeTx) {
				// Destructure to refer first entry of all the sent votes within the transaction
				const {
					params: {
						stakes: [stake],
					},
				} = stakeTx;
				refStaker = stakeTx.sender;
				refValidatorAddress = stake.validatorAddress;
			}
		} while (!refValidatorAddress);

		while (retries > 0 && !success) {
			try {
				const validatorsResponse = await request(wsRpcUrl, 'get.pos.validators', {
					address: refValidatorAddress,
				});
				[refValidator] = validatorsResponse.result.data;

				if (refValidator) {
					success = true;
				}
			} catch (error) {
				console.error(`Error fetching validators. Retries left: ${retries}`);
				retries--;

				// Delay by 3 sec
				await waitMs(3000);
			}
		}

		if (!success) {
			throw new Error('Failed to fetch validator address even after retrying.');
		}
	});

	it('should return list of stakers when requested for known validator address', async () => {
		const response = await getStakers({ address: refValidator.address });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data.stakers.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakers.length).toBeLessThanOrEqual(10);
	});

	it('should return list of stakers when requested for known validator address and search param (exact staker name)', async () => {
		const response = await getStakers({ address: refValidator.address, search: refStaker.name });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data.stakers.length).toBe(1);
		expect(result.data.stakers[0].address).toBe(refStaker.address);
	});

	it('should return list of stakers when requested for known validator address and search address (exact staker address)', async () => {
		const response = await getStakers({
			address: refValidator.address,
			search: refStaker.address,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data.stakers.length).toBe(1);
		expect(result.data.stakers[0].address).toBe(refStaker.address);
	});

	it('should return list of stakers when requested for known validator address and search public key (exact staker public key)', async () => {
		const response = await getStakers({
			address: refValidator.address,
			search: refStaker.publicKey,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data.stakers.length).toBe(1);
		expect(result.data.stakers[0].address).toBe(refStaker.address);
	});

	it('should return list of stakers when requested for known validator address and search param (partial staker name)', async () => {
		const searchParam = refStaker.name ? refStaker.name.substring(0, 3) : '';
		const response = await getStakers({ address: refValidator.address, search: searchParam });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data.stakers.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakers.length).toBeLessThanOrEqual(10);
		expect(result.data.stakers.some(staker => staker.address === refStaker.address)).toBe(true);
	});

	it('should return list of stakers when requested for known validator address and search param (partial staker address)', async () => {
		const searchParam = refStaker.address ? refStaker.address.substring(0, 3) : '';
		const response = await getStakers({ address: refValidator.address, search: searchParam });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data.stakers.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakers.length).toBeLessThanOrEqual(10);
		expect(result.data.stakers.some(staker => staker.address === refStaker.address)).toBe(true);
	});

	it('should return list of stakers when requested for known validator address and search param (partial staker public key)', async () => {
		const searchParam = refStaker.publicKey ? refStaker.publicKey.substring(0, 3) : '';
		const response = await getStakers({ address: refValidator.address, search: searchParam });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data.stakers.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakers.length).toBeLessThanOrEqual(10);
		expect(result.data.stakers.some(staker => staker.address === refStaker.address)).toBe(true);
	});

	it('should return list of stakers when requested with known validator address and offset=1', async () => {
		const response = await getStakers({ address: refValidator.address, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data.stakers.length).toBeGreaterThanOrEqual(0);
		expect(result.data.stakers.length).toBeLessThanOrEqual(10);
	});

	it('should return list of stakers when requested with known validator address and limit=5', async () => {
		const response = await getStakers({ address: refValidator.address, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data.stakers.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakers.length).toBeLessThanOrEqual(5);
	});

	it('should return list of stakers when requested with known validator address, offset=1 and limit=5', async () => {
		const response = await getStakers({
			address: refValidator.address,
			offset: 1,
			limit: 5,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data.stakers.length).toBeGreaterThanOrEqual(0);
		expect(result.data.stakers.length).toBeLessThanOrEqual(5);
	});

	it('should return list of stakers when requested for known validator publicKey', async () => {
		if (refValidator.publicKey) {
			const response = await getStakers({ publicKey: refValidator.publicKey });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(goodRequestSchema);
			expect(result.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(result.data.stakers.length).toBeLessThanOrEqual(10);
		}
	});

	it('should return list of stakers when requested with known validator publicKey and offset=1', async () => {
		if (refValidator.publicKey) {
			const response = await getStakers({ publicKey: refValidator.publicKey, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(goodRequestSchema);
			expect(result.data.stakers.length).toBeGreaterThanOrEqual(0);
			expect(result.data.stakers.length).toBeLessThanOrEqual(10);
		}
	});

	it('should return list of stakers when requested with known validator publicKey and limit=5', async () => {
		if (refValidator.publicKey) {
			const response = await getStakers({ publicKey: refValidator.publicKey, limit: 5 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(goodRequestSchema);
			expect(result.data.stakers.length).toBeGreaterThanOrEqual(1);
			expect(result.data.stakers.length).toBeLessThanOrEqual(5);
		}
	});

	it('should return list of stakers when requested with known validator publicKey, offset=1 and limit=5', async () => {
		if (refValidator.publicKey) {
			const response = await getStakers({
				publicKey: refValidator.publicKey,
				offset: 1,
				limit: 5,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(goodRequestSchema);
			expect(result.data.stakers.length).toBeGreaterThanOrEqual(0);
			expect(result.data.stakers.length).toBeLessThanOrEqual(5);
		}
	});

	it('should return list of stakers when requested for known validator name', async () => {
		const response = await getStakers({ name: refValidator.name });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data.stakers.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakers.length).toBeLessThanOrEqual(10);
	});

	it('should return list of stakers when requested with known validator name and offset=1', async () => {
		const response = await getStakers({ name: refValidator.name, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data.stakers.length).toBeGreaterThanOrEqual(0);
		expect(result.data.stakers.length).toBeLessThanOrEqual(10);
	});

	it('should return list of stakers when requested with known validator name and limit=5', async () => {
		const response = await getStakers({ name: refValidator.name, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data.stakers.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakers.length).toBeLessThanOrEqual(5);
	});

	it('should return list of stakers when requested with known validator name, offset=1 and limit=5', async () => {
		const response = await getStakers({ name: refValidator.name, offset: 1, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data.stakers.length).toBeGreaterThanOrEqual(0);
		expect(result.data.stakers.length).toBeLessThanOrEqual(5);
	});

	it('should return empty when requested for known non-validator address', async () => {
		const response = await getStakers({ address: 'lsk99999999999999999999999999999999999999' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data.stakers.length).toBe(0);
	});

	it('should return empty list when requested with invalid address and publicKey pair', async () => {
		const response = await getStakers({
			address: refValidator.address,
			publicKey: '796c94fe1e53c4dd63f5a181450811aa53bfc38dcad038c1b884e8cb45e26823',
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data.stakers.length).toBe(0);
	});

	it('should return invalid request if address, publicKey and name is missing', async () => {
		const response = await getStakers();
		expect(response).toMap(invalidRequestSchema);
	});

	it('should return invalid request for invalid address', async () => {
		for (let i = 0; i < invalidAddresses.length; i++) {
			const response = await getStakers({ address: invalidAddresses[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid request for invalid publicKey', async () => {
		for (let i = 0; i < invalidPublicKeys.length; i++) {
			const response = await getStakers({ publicKey: invalidPublicKeys[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid request for invalid name', async () => {
		for (let i = 0; i < invalidNames.length; i++) {
			const response = await getStakers({ name: invalidNames[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid request for invalid search', async () => {
		for (let i = 0; i < invalidPartialSearches.length; i++) {
			const response = await getStakers({
				address: refValidator.address,
				search: invalidPartialSearches[i],
			});
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid request for invalid limit', async () => {
		for (let i = 0; i < invalidLimits.length; i++) {
			const response = await getStakers({ address: refValidator.address, limit: invalidLimits[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid request for invalid offset', async () => {
		for (let i = 0; i < invalidOffsets.length; i++) {
			const response = await getStakers({
				address: refValidator.address,
				offset: invalidOffsets[i],
			});
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid request for invalid param', async () => {
		const response = await getStakers({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid request for empty param', async () => {
		const response = await getStakers({ invalidParam: '' });
		expect(response).toMap(invalidParamsSchema);
	});
});
