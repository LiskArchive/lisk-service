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
const config = require('../../config');
const { api } = require('../../helpers/api');

const {
	badRequestSchema,
} = require('../../schemas/httpGenerics.schema');

const {
	statusSchema,
} = require('../../schemas/gateway.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const endpoint = `${baseUrl}/api/status`;

describe('Status API', () => {
	it('Report status -> 200 OK', async () => {
		const response = await api.get(endpoint);
		expect(response).toMap(statusSchema);
	});

	it('params not supported -> 400 BAD_REQUEST', async () => {
		const response = await api.get(`${endpoint}?someparam='not_supported'`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
