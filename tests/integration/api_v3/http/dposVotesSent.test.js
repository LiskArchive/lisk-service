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
	voteSchema,
} = require('../../../schemas/api_v3/vote.schema');

[
	`${baseUrlV3}/dpos/votes/sent`,
].forEach(endpoint => {
	// TODO: Enable when test blockchain is updated
	xdescribe('Votes Sent (Votes) API', () => {
		let refDelegate;
		beforeAll(async () => {
			let response;
			do {
				// eslint-disable-next-line no-await-in-loop
				response = await api.get(`${baseUrlV3}/dpos/delegates?limit=1`);
			} while (!response.data);
			[refDelegate] = response.data;
		});

		describe(`GET ${endpoint}`, () => {
			it('Returns list of votes when requested for existing account by address', async () => {
				const response = await api.get(`${endpoint}?address=${refDelegate.address}`);
				expect(response.data).toMap(voteSchema);
				expect(response.meta).toMap(metaSchema);
			});

			it('Returns list of votes when requested for existing account by name', async () => {
				if (refDelegate.name) {
					const response = await api.get(`${endpoint}?name=${refDelegate.name}`);
					expect(response.data).toMap(voteSchema);
					expect(response.meta).toMap(metaSchema);
				}
			});

			it('Returns list of votes when requested for existing account by address and limit=10', async () => {
				const response = await api.get(`${endpoint}?address=${refDelegate.address}&limit=10`);
				expect(response.data).toMap(voteSchema);
				expect(response.meta).toMap(metaSchema);
			});

			it('Returns list of votes when requested for existing account by address, limit=10 and offset=1', async () => {
				const response = await api.get(`${endpoint}?address=${refDelegate.address}&limit=10&offset=1`);
				expect(response.data).toMap(voteSchema);
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
});
