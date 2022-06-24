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
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	voterSchema,
} = require('../../../schemas/api_v3/voter.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getVoters = async params => request(wsRpcUrl, 'get.dpos.votes.received', params);

// TODO: Enable when test blockchain is updated
xdescribe('get.dpos.votes.received', () => {
	let refDelegate;
	let refDelegateAddress;
	beforeAll(async () => {
		do {
			// eslint-disable-next-line no-await-in-loop
			const response1 = await request(wsRpcUrl, 'get.transactions', { moduleCommandID: '13:1', limit: 1 });
			const { data: [voteTx] = [] } = response1.result;
			if (voteTx) {
				// Destructure to refer first entry of all the sent votes within the transaction
				const { params: { votes: [vote] } } = voteTx;
				refDelegateAddress = vote.delegateAddress;
			}
		} while (!refDelegateAddress);
		const response2 = await request(wsRpcUrl, 'get.dpos.delegates', { address: refDelegateAddress });
		[refDelegate] = response2.result.data;
	});

	it('Returns list of voters when requested for existing account by address', async () => {
		const response = await getVoters({ address: refDelegate.address });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toMap(voterSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		expect(result.meta).toMap(metaSchema);
	});

	it('Returns list of voters when requested for existing account by name', async () => {
		if (refDelegate.name) {
			const response = await getVoters({ name: refDelegate.name });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toMap(voterSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(result.meta).toMap(metaSchema);
		}
	});

	it('Returns list of voters when requested with address and offset=1', async () => {
		const response = await getVoters({ address: refDelegate.address, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toMap(voterSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		expect(result.meta).toMap(metaSchema);
	});

	it('Returns list of voters when requested with address and limit=5', async () => {
		const response = await getVoters({ address: refDelegate.address, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toMap(voterSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(5);
		expect(result.meta).toMap(metaSchema);
	});

	it('Returns list of voters when requested with address, offset=1 and limit=5', async () => {
		const response = await getVoters({
			address: refDelegate.address, offset: 1, limit: 5,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toMap(voterSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(5);
		expect(result.meta).toMap(metaSchema);
	});

	it('No address -> invalid param', async () => {
		const response = await getVoters();
		expect(response).toMap(invalidParamsSchema);
	});

	it('invalid request param -> invalid param', async () => {
		const response = await getVoters({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('invalid address -> invalid param', async () => {
		const response = await getVoters({ address: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});
});
