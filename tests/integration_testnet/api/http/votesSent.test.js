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
const config = require('../../config');
const { api } = require('../../helpers/api');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const accountEndpoint = `${baseUrlV1}/account`;

const {
	goodRequestSchema,
	badRequestSchema,
	notFoundSchema,
	wrongInputParamSchema,
	metaSchema,
} = require('../../schemas/httpGenerics.schema');

const {
	voteSchema,
} = require('../../schemas/vote.schema');

describe('Votes API', () => {
	xdescribe('GET /account/{address}/votes', () => {
		it('existing account -> ok', async () => {
			const response = await api.get(`${accountEndpoint}/16313739661670634666L/votes`);
			expect(response.data[0]).toMap(voteSchema);
		});

		it('existing user name -> ok', async () => {
			const response = await api.get(`${accountEndpoint}/gottavoteemall/votes`);
			expect(response.data[0]).toMap(voteSchema);
		});

		it('existing public key -> ok', async () => {
			const response = await api.get(`${accountEndpoint}/d258627878a9b360fe4934218d2415d66b1ed2ef63ce097280bf02189a91468d/votes`);
			expect(response.data[0]).toMap(voteSchema);
		});

		it('existing account with address: -> ok', async () => {
			const response = await api.get(`${accountEndpoint}/address:16313739661670634666L/votes`);
			expect(response.data[0]).toMap(voteSchema);
		});

		it('existing user name with username: -> ok', async () => {
			const response = await api.get(`${accountEndpoint}/username:gottavoteemall/votes`);
			expect(response.data[0]).toMap(voteSchema);
		});

		it('existing public key with publickey: -> ok', async () => {
			const response = await api.get(`${accountEndpoint}/publickey:d258627878a9b360fe4934218d2415d66b1ed2ef63ce097280bf02189a91468d/votes`);
			expect(response.data[0]).toMap(voteSchema);
		});

		it('wrong address -> 404', async () => {
			const url = `${accountEndpoint}/999999999L/votes`;
			const expectedStatus = 404;
			const response = api.get(url, expectedStatus);
			expect(response).resolves.toMap(notFoundSchema);
		});
	});
});
