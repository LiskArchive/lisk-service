/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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

const { invalidParamsSchema, jsonRpcEnvelopeSchema } = require('../../../schemas/rpcGenerics.schema');
const { goodRequestSchema } = require('../../../schemas/api_v3/staker.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getStakers = async params => request(wsRpcUrl, 'get.pos.stakers', params);

describe('get.pos.stakers', () => {
	let refValidator;
	let refValidatorAddress;
	beforeAll(async () => {
		do {
			// eslint-disable-next-line no-await-in-loop
			const response1 = await request(wsRpcUrl, 'get.transactions', { moduleCommand: 'pos:stake', limit: 1 });
			const { data: [stakeTx] = [] } = response1.result;
			if (stakeTx) {
				// Destructure to refer first entry of all the sent votes within the transaction
				const { params: { stakes: [stake] } } = stakeTx;
				refValidatorAddress = stake.validatorAddress;
			}
		} while (!refValidatorAddress);
		const response2 = await request(wsRpcUrl, 'get.pos.validators', { address: refValidatorAddress });
		[refValidator] = response2.result.data;
	});

	it('Returns list of stakers when requested for known validator address', async () => {
		const response = await getStakers({ address: refValidator.address });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
		expect(response.data.stakers.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of stakers when requested with known validator address and offset=1', async () => {
		const response = await getStakers({ address: refValidator.address, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
		expect(response.data.stakers.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of stakers when requested with known validator address and limit=5', async () => {
		const response = await getStakers({ address: refValidator.address, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
		expect(response.data.stakers.length).toBeLessThanOrEqual(5);
	});

	it('Returns list of stakers when requested with known validator address, offset=1 and limit=5', async () => {
		const response = await getStakers({
			address: refValidator.address, offset: 1, limit: 5,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(response.data.stakers.length).toBeGreaterThanOrEqual(0);
		expect(response.data.stakers.length).toBeLessThanOrEqual(5);
	});

	it('Returns list of stakers when requested for known validator publicKey', async () => {
		const response = await getStakers({ publicKey: refValidator.publicKey });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
		expect(response.data.stakers.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of stakers when requested with known validator publicKey and offset=1', async () => {
		const response = await getStakers({ publicKey: refValidator.publicKey, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
		expect(response.data.stakers.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of stakers when requested with known validator publicKey and limit=5', async () => {
		const response = await getStakers({ publicKey: refValidator.publicKey, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
		expect(response.data.stakers.length).toBeLessThanOrEqual(5);
	});

	it('Returns list of stakers when requested with known validator publicKey, offset=1 and limit=5', async () => {
		const response = await getStakers({
			publicKey: refValidator.publicKey, offset: 1, limit: 5,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(response.data.stakers.length).toBeGreaterThanOrEqual(0);
		expect(response.data.stakers.length).toBeLessThanOrEqual(5);
	});

	it('Returns list of stakers when requested for known validator name', async () => {
		const response = await getStakers({ name: refValidator.name });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
		expect(response.data.stakers.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of stakers when requested with known validator name and offset=1', async () => {
		const response = await getStakers({ name: refValidator.name, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
		expect(response.data.stakers.length).toBeLessThanOrEqual(10);
	});

	it('Returns list of stakers when requested with known validator name and limit=5', async () => {
		const response = await getStakers({ name: refValidator.name, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(response.data.stakers.length).toBeGreaterThanOrEqual(1);
		expect(response.data.stakers.length).toBeLessThanOrEqual(5);
	});

	it('Returns list of stakers when requested with known validator name, offset=1 and limit=5', async () => {
		const response = await getStakers({ name: refValidator.name, offset: 1, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(response.data.stakers.length).toBeGreaterThanOrEqual(0);
		expect(response.data.stakers.length).toBeLessThanOrEqual(5);
	});

	it('Returns empty when requested for known non-validator address', async () => {
		const response = await getStakers({ name: 'lsk99999999999999999999999999999999999999' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(response.data.stakers.length).toBe(0);
	});

	it('No address -> invalid param', async () => {
		const response = await getStakers();
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid request param -> invalid param', async () => {
		const response = await getStakers({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid address -> invalid param', async () => {
		const response = await getStakers({ address: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});
});
