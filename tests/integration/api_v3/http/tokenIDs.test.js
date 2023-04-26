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
const config = require('../../../config');
const { api } = require('../../../helpers/api');

const {
	goodRequestSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	tokenIDsSchema,
	tokenIDsMetaSchema,
} = require('../../../schemas/api_v3/tokenIDs.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/token/ids`;

describe('Token IDs API', () => {
	it('Should retrieves token info when called without any params', async () => {
		const response = await api.get(`${endpoint}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(tokenIDsSchema);
		expect(response.meta).toMap(tokenIDsMetaSchema);
	});
});
