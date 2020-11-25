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
	notFoundSchema,
} = require('../../schemas/httpGenerics.schema');

const {
	voterSchema,
} = require('../../schemas/voter.schema');

describe('Voters API', () => {
	let refDelegate;
	beforeAll(async () => {
		[refDelegate] = (await api.get(`${baseUrlV1}/delegates?limit=1`)).data;
	});
	xdescribe('GET /account/{address}/voters', () => {
		it('matches specific schema when requested existing account by account ID', async () => {
			const response = await api.get(`${accountEndpoint}/2581762640681118072L/voters`);
			expect(response.data[0]).toMap(voterSchema);
		});

		it('matches specific data when requested existing account by account ID', async () => {
			const response = await api.get(`${accountEndpoint}/2581762640681118072L/voters`);
			expect(response.data).toEqual([
				{
					address: '16313739661670634666L',
					balance: '9967545010836600',
					publicKey: 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
				},
				{
					address: '4401082358022424760L',
					balance: '997100000000',
					publicKey: 'd258627878a9b360fe4934218d2415d66b1ed2ef63ce097280bf02189a91468d',
				},
			]);
		});

		it('matches specific schema when requested existing account by username', async () => {
			const response = await api.get(`${accountEndpoint}/genesis_14/voters`);
			expect(response.data[0]).toMap(voterSchema);
		});

		it('matches specific schema when requested existing account by public key', async () => {
			const response = await api.get(`${accountEndpoint}/1af35b29ca515ff5b805a5e3a0ab8c518915b780d5988e76b0672a71b5a3be02/voters`);
			expect(response.data[0]).toMap(voterSchema);
		});

		it('matches specific schema when requested existing account by account ID (explicit)', async () => {
			const response = await api.get(`${accountEndpoint}/address:2581762640681118072L/voters`);
			expect(response.data[0]).toMap(voterSchema);
		});

		it('matches specific schema when requested existing account by username (explicit)', async () => {
			const response = await api.get(`${accountEndpoint}/username:genesis_14/voters`);
			expect(response.data[0]).toMap(voterSchema);
		});

		it('matches specific schema when requested existing account by publickey (explicit)', async () => {
			const response = await api.get(`${accountEndpoint}/publickey:1af35b29ca515ff5b805a5e3a0ab8c518915b780d5988e76b0672a71b5a3be02/voters`);
			expect(response.data[0]).toMap(voterSchema);
		});

		it('results in NOT_FOUND (404) requested wrong address ', async () => {
			const url = `${accountEndpoint}/999999999L/voters`;
			const expectedStatus = 404;
			const response = api.get(url, expectedStatus);
			expect(response).resolves.toMap(notFoundSchema);
		});
	});
});
