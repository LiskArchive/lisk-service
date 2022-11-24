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

const {
	badRequestSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	goodRequestSchema,
} = require('../../../schemas/api_v3/fees.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/fees`;

describe('Fee estimates API', () => {
	it('estimate fees true -> 200 OK', async () => {
		const response = await api.get(`${endpoint}`);
		expect(response).toMap(goodRequestSchema);
	});

	it('params not supported -> 400 BAD_REQUEST', async () => {
		const response = await api.get(`${endpoint}?someparam='not_supported'`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
