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

const { badRequestSchema, goodRequestSchema } = require('../../../schemas/httpGenerics.schema');

const { networkStatisticsSchema } = require('../../../schemas/api_v3/networkStatistics.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/network/statistics`;

describe(`GET ${endpoint}`, () => {
	it('should return network statistics', async () => {
		const response = await api.get(endpoint);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(networkStatisticsSchema);
	});

	it('should return bad request for unsupported param', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request for empty param', async () => {
		const response = await api.get(`${endpoint}?emptyParam=`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
