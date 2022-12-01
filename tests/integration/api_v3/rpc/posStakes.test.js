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
	voteSchema,
} = require('../../../schemas/api_v3/vote.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getVotes = async (params) => request(wsRpcUrl, 'get.pos.stakes', params);

describe('get.pos.stakes', () => {
	let refDelegate;
	beforeAll(async () => {
		let response;
		do {
			// eslint-disable-next-line no-await-in-loop
			response = await request(wsRpcUrl, 'get.dpos.delegates', { limit: 1 });
		} while (!response.result);
		[refDelegate] = response.result.data;
	});

	it('Returns list of votes when requested for existing account by address', async () => {
		const response = await getVotes({ address: refDelegate.address });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toMap(voteSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		expect(result.meta).toMap(metaSchema);
	});

	it('Returns list of votes when requested for existing account by name', async () => {
		if (refDelegate.name) {
			const response = await getVotes({ name: refDelegate.name });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toMap(voteSchema);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(result.meta).toMap(metaSchema);
		}
	});

	it('Returns list of votes when requested for existing account by address and limit=5', async () => {
		const response = await getVotes({ address: refDelegate.address, limit: 5 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toMap(voteSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(5);
		expect(result.meta).toMap(metaSchema);
	});

	it('Returns list of votes when requested for existing account by address, limit=5 and offset=1', async () => {
		const response = await getVotes({ address: refDelegate.address, limit: 5, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toMap(voteSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(5);
		expect(result.meta).toMap(metaSchema);
	});

	it('No address -> invalid param', async () => {
		const response = await getVotes();
		expect(response).toMap(invalidParamsSchema);
	});

	it('invalid request param -> invalid param', async () => {
		const response = await getVotes({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('invalid address -> invalid param', async () => {
		const response = await getVotes({ address: 'L' });
		expect(response).toMap(invalidParamsSchema);
	});
});
