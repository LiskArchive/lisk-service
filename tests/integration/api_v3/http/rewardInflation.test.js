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
} = require('../../../schemas/httpGenerics.schema');

const {
	rewardInflationResponseSchema,
} = require('../../../schemas/api_v3/rewardInflation.schema');

const endpoint = `${baseUrlV3}/reward/inflation`;

let latestBlockHeight;

beforeAll(async () => {
	const response = await api.get(`${baseUrlV3}/network/status`);
	latestBlockHeight = response.data.height;
});

describe(`GET ${endpoint}`, () => {
	it('should return current inflation rate when called with latest block height', async () => {
		const response = await api.get(`${endpoint}?height=${latestBlockHeight}`);
		expect(response).toMap(rewardInflationResponseSchema);
	});

	it('should return bad request when called with unsupported param', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request param when called without param', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(badRequestSchema);
	});
});
