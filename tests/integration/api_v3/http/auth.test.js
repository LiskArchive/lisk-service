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
	goodRequestSchemaForAuth,
	authAccountSchema,
	authAccountMetaSchema,
} = require('../../../schemas/api_v3/authAccountSchema.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/auth`;

// TODO: Enable when test blockchain is updated
xdescribe('Auth accounts API', () => {
	let refTransaction;
	beforeAll(async () => {
		const response = await api.get(`${baseUrlV3}/transactions?limit=1&moduleCommandID=12:0`);
		[refTransaction] = response.data;
	});

	it('retrieves auth account info -> ok', async () => {
		const response = await api.get(`endpoint?address=${refTransaction.sender.address}`);
		expect(response).toMap(goodRequestSchemaForAuth);
		expect(response.data).toMap(authAccountSchema);
		expect(response.meta).toMap(authAccountMetaSchema);
	});

	it('No address -> bad request', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('invalid address -> 400', async () => {
		const response = await api.get(`${endpoint}?address=lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('invalid request param -> bad request', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
