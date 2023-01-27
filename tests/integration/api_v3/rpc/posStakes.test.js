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

const {
	stakesResponseSchema,
} = require('../../../schemas/api_v3/stakes.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getStakes = async (params) => request(wsRpcUrl, 'get.pos.stakes', params);

describe('get.pos.stakes', () => {
	let refStaker;
	let refValidator;
	let maxNumberSentStakes;
	beforeAll(async () => {
		let refValidatorAddress;
		const posConstants = (await request(wsRpcUrl, 'get.pos.constants')).result;
		maxNumberSentStakes = posConstants.data.maxNumberSentStakes;

		do {
			// eslint-disable-next-line no-await-in-loop
			const response = await request(wsRpcUrl, 'get.transactions', { moduleCommand: 'pos:stake', limit: 1 });
			const { data: [stakeTx] = [] } = response.result;
			if (stakeTx) {
				const { params: { stakes: [stake] } } = stakeTx;
				refValidatorAddress = stake.validatorAddress;
				refStaker = stakeTx.sender;
			}
		} while (!refStaker);
		const validatorsResponse = await request(wsRpcUrl, 'get.pos.validators', { address: refValidatorAddress });
		[refValidator] = validatorsResponse.result.data;
	});

	it('Returns list of stakes when requested for known staker address', async () => {
		const response = await getStakes({ address: refStaker.address });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakesResponseSchema);
		expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
	});

	it('Returns list of stakes when requested for known staker address and search (exact validator name) param', async () => {
		const response = await getStakes({ address: refStaker.address, search: refValidator.name });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakesResponseSchema);
		expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
		expect(response.data.stakes[0].address).toBe(refValidator.address);
	});

	it('Returns list of stakes when requested for known staker address and search (partial validator name) param', async () => {
		const response = await getStakes({ address: refStaker.address, search: refValidator.name[0] });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakesResponseSchema);
		expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
		expect(result.data.stakes.some(staker => staker.address === refValidator.address))
			.toBe(true);
	});

	it('Returns list of stakes when requested for known staker name', async () => {
		const response = await getStakes({ name: refStaker.name });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakesResponseSchema);
		expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
	});

	it('Returns list of stakes when requested for known staker publicKey', async () => {
		const response = await getStakes({ publicKey: refStaker.publicKey });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakesResponseSchema);
		expect(result.data.stakes.length).toBeGreaterThanOrEqual(1);
		expect(result.data.stakes.length).toBeLessThanOrEqual(maxNumberSentStakes);
	});

	it('Returns empty list when requested with invalid address and publicKey pair', async () => {
		const response = await getStakes({
			address: refValidator.address,
			publicKey: '796c94fe1e53c4dd63f5a181450811aa53bfc38dcad038c1b884e8cb45e26823'
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(stakesResponseSchema);
		expect(result.data.stakers.length).toBe(0);
	});

	it('No address -> invalid param', async () => {
		const response = await getStakes();
		expect(response).toMap(invalidRequestSchema);
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
