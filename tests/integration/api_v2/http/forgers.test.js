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

const {
	badRequestSchema,
	goodRequestSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	forgerSchema,
} = require('../../../schemas/api_v2/forger.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const endpoint = `${baseUrl}/api/v2`;

describe('Forgers API', () => {
	describe('GET /forgers', () => {
		it('limit = 100 -> ok', async () => {
			const response = await api.get(`${endpoint}/forgers?limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(100);
			response.data.map(forger => expect(forger).toMap(forgerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('limit = 0 -> 400', async () => {
			const response = await api.get(`${endpoint}/forgers?limit=0`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('empty limit -> all forgers', async () => {
			const response = await api.get(`${endpoint}/forgers?limit=`);
			expect(response).toMap(goodRequestSchema);
			response.data.map(forger => expect(forger).toMap(forgerSchema));
			expect(response.meta).toMap(metaSchema);
		});
	});
});
