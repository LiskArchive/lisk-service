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
	legacyAccountsSchema,
	legacyAccountsMetaSchema,
} = require('../../../schemas/api_v3/legacyAccountsSchema.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/legacy`;

describe('Legacy accounts API', () => {
	// TODO: Enable when legacy account public key is available on test blockchain
	xit('retrieves legacy account info -> ok', async () => {
		const publicKey = '';
		const response = await api.get(`endpoint?publicKey=${publicKey}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(legacyAccountsSchema);
		expect(response.meta).toMap(legacyAccountsMetaSchema);
	});

	it('No publicKey -> bad request', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('invalid request param -> bad request', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
