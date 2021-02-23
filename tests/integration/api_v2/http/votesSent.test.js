/* eslint-disable quote-props */
/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const baseUrlV2 = `${baseUrl}/api/v2`;

const {
	badRequestSchema,
	notFoundSchema,
	wrongInputParamSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	voteSchemaVersion5,
} = require('../../../schemas/vote.schema');

[
	`${baseUrlV2}/votes_sent`,
	// `${baseUrlV2}/votes`, TODO : Added support for api/v2/votes
].forEach(endpoint => {
	describe('Votes Sent (Votes) API', () => {
		let refDelegate;
		beforeAll(async () => {
			[refDelegate] = (await api.get(`${baseUrlV2}/accounts?isDelegate=true&limit=1`)).data;
		});

		describe(`GET ${endpoint}`, () => {
			it('Returns list of votes when requested for existing account by account ID', async () => {
				const response = await api.get(`${endpoint}?address=${refDelegate.summary.address}`);
				expect(response.data).toMap(voteSchemaVersion5);
				expect(response.meta).toMap(metaSchema);
			});

			it('Returns list of votes when requested for existing account by username', async () => {
				if (refDelegate.summary.username) {
					const response = await api.get(`${endpoint}?username=${refDelegate.summary.username}`);
					expect(response.data).toMap(voteSchemaVersion5);
					expect(response.meta).toMap(metaSchema);
				}
			});

			it('Returns list of votes when requested for existing account by publickey', async () => {
				if (refDelegate.summary.publicKey) {
					const response = await api.get(`${endpoint}?publickey=${refDelegate.summary.publicKey}`);
					expect(response.data).toMap(voteSchemaVersion5);
					expect(response.meta).toMap(metaSchema);
				}
			});

			it('Returns list of votes when requested with offset', async () => {
				const response = await api.get(`${endpoint}?address=${refDelegate.summary.address}&offset=1`);
				expect(response.data).toMap(voteSchemaVersion5);
				expect(response.meta).toMap(metaSchema);
			});

			it('Returns list of votes when requested with limit', async () => {
				const response = await api.get(`${endpoint}?address=${refDelegate.summary.address}&limit=1`);
				expect(response.data).toMap(voteSchemaVersion5);
				expect(response.meta).toMap(metaSchema);
			});

			it('Returns list of votes when requested with offset & limit', async () => {
				const response = await api.get(`${endpoint}?address=${refDelegate.summary.address}&offset=1&limit=1`);
				expect(response.data).toMap(voteSchemaVersion5);
				expect(response.meta).toMap(metaSchema);
			});

			it('Returns BAD_REQUEST (400) when requested with limit = 0', async () => {
				const response = await api.get(`${endpoint}?limit=0`, 400);
				expect(response).toMap(badRequestSchema);
			});

			it('Returns NOT_FOUND (404) when requested with wrong address', async () => {
				const response = await api.get(`${endpoint}?address=999999999L`, 404);
				expect(response).toMap(notFoundSchema);
			});

			it('Returns BAD_REQUEST (400) when requested with unsupported param', async () => {
				const response = await api.get(`${endpoint}?unsupported_param=999999999L`, 400);
				expect(response).toMap(wrongInputParamSchema);
			});

			it('Returns BAD_REQUEST (400) when requested without required params', async () => {
				const response = await api.get(`${endpoint}`, 400);
				expect(response).toMap(badRequestSchema);
			});
		});
	});
});
