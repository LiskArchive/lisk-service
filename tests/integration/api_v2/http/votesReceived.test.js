/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
	voterSchemaVersion5,
} = require('../../../schemas/voter.schema');

[
	`${baseUrlV2}/votes_received`,
].forEach(endpoint => {
	describe('Votes Received (Voters) API', () => {
		let refDelegate;
		let refDelegateAddress;
		beforeAll(async () => {
			do {
				// eslint-disable-next-line no-await-in-loop
				const { data: [voteTx] = [] } = await api.get(`${baseUrlV2}/transactions?moduleAssetId=5:1&limit=1`);
				if (voteTx) {
					// Destructure to refer first entry of all the sent votes within the transaction
					const { asset: { votes: [vote] } } = voteTx;
					refDelegateAddress = vote.delegateAddress;
				}
			} while (!refDelegateAddress);
			const response2 = await api.get(`${baseUrlV2}/accounts?address=${refDelegateAddress}`);
			[refDelegate] = response2.data;
		});

		describe(`GET ${endpoint}`, () => {
			it('Returns list of voters when requested for existing account by account ID', async () => {
				const response = await api.get(`${endpoint}?address=${refDelegate.summary.address}`);
				expect(response.data).toMap(voterSchemaVersion5);
				expect(response.meta).toMap(metaSchema);
			});

			it('Returns list of voters when requested for existing account by username', async () => {
				if (refDelegate.summary.username) {
					const response = await api.get(`${endpoint}?username=${refDelegate.summary.username}`);
					expect(response.data).toMap(voterSchemaVersion5);
					expect(response.meta).toMap(metaSchema);
				}
			});

			it('Returns list of voters when requested for existing account by publickey', async () => {
				if (refDelegate.summary.publicKey) {
					const response = await api.get(`${endpoint}?publicKey=${refDelegate.summary.publicKey}`);
					expect(response.data).toMap(voterSchemaVersion5);
					expect(response.meta).toMap(metaSchema);
				}
			});

			it('Returns list of voters when requested with offset', async () => {
				const response = await api.get(`${endpoint}?address=${refDelegate.summary.address}&offset=1`);
				expect(response.data).toMap(voterSchemaVersion5);
				expect(response.meta).toMap(metaSchema);
			});

			it('Returns list of voters when requested with limit', async () => {
				const response = await api.get(`${endpoint}?address=${refDelegate.summary.address}&limit=1`);
				expect(response.data).toMap(voterSchemaVersion5);
				expect(response.meta).toMap(metaSchema);
			});

			it('Returns list of voters when requested with offset & limit', async () => {
				const response = await api.get(`${endpoint}?address=${refDelegate.summary.address}&offset=1&limit=1`);
				expect(response.data).toMap(voterSchemaVersion5);
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
