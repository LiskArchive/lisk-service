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

const { badRequestSchema } = require('../../../schemas/httpGenerics.schema');

const {
	goodRequestSchemaForAuth,
	authAccountInfoSchema,
	authAccountMetaSchema,
} = require('../../../schemas/api_v3/authAccountSchema.schema');
const { invalidAddresses } = require('../constants/invalidInputs');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/auth`;

describe('Auth accounts API', () => {
	let refTransaction;
	beforeAll(async () => {
		const response = await api.get(
			`${baseUrlV3}/transactions?limit=1&moduleCommand=auth:registerMultisignature`,
		);
		[refTransaction] = response.data;
	});

	it('should retrieve auth account info for a valid address', async () => {
		const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}`);
		expect(response).toMap(goodRequestSchemaForAuth);
		expect(response.data).toMap(authAccountInfoSchema);
		expect(response.meta).toMap(authAccountMetaSchema);
	});

	it('should return bad request for missing address parameter', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request for an invalid address', async () => {
		for (let i = 0; i < invalidAddresses.length; i++) {
			const response = await api.get(`${endpoint}?address=${invalidAddresses[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});
});
