/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
	serviceUnavailableSchema,
} = require('../../schemas/httpGenerics.schema');

const {
	readySchema,
} = require('../../schemas/gateway/ready.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const endpoint = `${baseUrl}/api/ready`;

describe('Ready API', () => {
	describe(`GET ${endpoint}`, () => {
		it('Report readiness -> 200 OK', async () => {
			try {
				const response = await api.get(endpoint);
				expect(response).toMap(readySchema);
			} catch (_) {
				const expectedResponseCode = 503;
				const response = await api.get(endpoint, expectedResponseCode);
				expect(response).toMap(serviceUnavailableSchema);
			}
		});

		it('params not supported -> 400 BAD_REQUEST', async () => {
			const response = await api.get(`${endpoint}?someparam='not_supported'`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});
});
