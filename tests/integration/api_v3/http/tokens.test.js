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
	goodRequestSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	tokensSchema,
	tokensMetaSchema,
} = require('../../../schemas/api_v3/tokensSchema.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/tokens`;

describe('Legacy accounts API', () => {
	// TODO: Enable/update when token modules endpoints works
	xit('retrieves tokens info when call with address-> ok', async () => {
		const address = '';
		const response = await api.get(`endpoint?address=${address}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(tokensSchema);
		expect(response.meta).toMap(tokensMetaSchema);
	});

	// TODO: Enable/update when token modules endpoints works
	xit('retrieves token info when call with address and tokenID-> ok', async () => {
		const address = '';
		const tokenID = '';
		const response = await api.get(`endpoint?address=${address}&tokenID=${tokenID}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(tokensSchema);
		expect(response.meta).toMap(tokensMetaSchema);
	});

	it('No address -> bad request', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('invalid request param: TokenID with No address -> bad request', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('invalid request param -> bad request', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
