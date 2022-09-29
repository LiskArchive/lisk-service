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

const {	readySchema } = require('../../schemas/status.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const endpoint = `${baseUrl}/api`;

describe('Status reporting', () => {
	describe(`GET ${endpoint}`, () => {
		it('Report readiness -> 200 OK', async () => {
			const response = await api.get(`${endpoint}/ready`);
			expect(response).toMap(readySchema);
		});
	});
});
