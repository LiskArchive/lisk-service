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
const { api } = require('../../../helpers/api');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;

const {
	badRequestSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	voterSchema,
} = require('../../../schemas/api_v3/voter.schema');

const endpoint = `${baseUrlV3}/dpos/votes/received`;

describe('Votes Received (Voters) API', () => {
	let refDelegate;
	let refDelegateAddress;
	beforeAll(async () => {
		do {
			// eslint-disable-next-line no-await-in-loop
			const { data: [voteTx] = [] } = await api.get(`${baseUrlV3}/transactions?moduleCommand=dpos:voteDelegate&limit=1`);
			if (voteTx) {
				// Destructure to refer first entry of all the sent votes within the transaction
				const { params: { votes: [vote] } } = voteTx;
				refDelegateAddress = vote.delegateAddress;
			}
		} while (!refDelegateAddress);
		const response2 = await api.get(`${baseUrlV3}/dpos/delegates?address=${refDelegateAddress}`);
		[refDelegate] = response2.data;
	});

	describe(`GET ${endpoint}`, () => {
		it('Returns list of voters when requested for existing account by address', async () => {
			const response = await api.get(`${endpoint}?address=${refDelegate.address}`);
			expect(response.data).toMap(voterSchema);
			expect(response.data.votes.length).toBeGreaterThanOrEqual(1);
			expect(response.data.votes.length).toBeLessThanOrEqual(10);
			expect(response.meta).toMap(metaSchema);
		});

		it('Returns list of voters when requested for existing account by name', async () => {
			if (refDelegate.name) {
				const response = await api.get(`${endpoint}?name=${refDelegate.name}`);
				expect(response.data).toMap(voterSchema);
				expect(response.data.votes.length).toBeGreaterThanOrEqual(1);
				expect(response.data.votes.length).toBeLessThanOrEqual(10);
				expect(response.meta).toMap(metaSchema);
			}
		});

		it('Returns list of voters when requested with address and offset=1', async () => {
			const response = await api.get(`${endpoint}?address=${refDelegate.address}&offset=1`);
			expect(response.data).toMap(voterSchema);
			expect(response.data.votes.length).toBeGreaterThanOrEqual(1);
			expect(response.data.votes.length).toBeLessThanOrEqual(10);
			expect(response.meta).toMap(metaSchema);
		});

		it('Returns list of voters when requested with address and limit=5', async () => {
			const response = await api.get(`${endpoint}?address=${refDelegate.address}&limit=5`);
			expect(response.data).toMap(voterSchema);
			expect(response.data.votes.length).toBeGreaterThanOrEqual(1);
			expect(response.data.votes.length).toBeLessThanOrEqual(5);
			expect(response.meta).toMap(metaSchema);
		});

		it('Returns list of voters when requested with address, offset=1 and limit=5', async () => {
			const response = await api.get(`${endpoint}?address=${refDelegate.address}&offset=1&limit=5`);
			expect(response.data).toMap(voterSchema);
			expect(response.data.votes.length).toBeGreaterThanOrEqual(1);
			expect(response.data.votes.length).toBeLessThanOrEqual(5);
			expect(response.meta).toMap(metaSchema);
		});

		it('No address -> bad request', async () => {
			const response = await api.get(endpoint, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('invalid address -> bad request', async () => {
			const response = await api.get(`${endpoint}?address=address=L`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('invalid request param -> bad request', async () => {
			const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});
});
