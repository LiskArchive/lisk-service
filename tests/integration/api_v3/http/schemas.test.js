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
	allSchemasSchema,
	goodRequestSchema,
} = require('../../../schemas/api_v3/allSchemas.schema');

const schemas = require('../../../schemas/api_v3/constants/schemas');

const { badRequestSchema } = require('../../../schemas/httpGenerics.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/schemas`;

describe('Schemas API', () => {
	it('should return list of all available schemas', async () => {
		const response = await api.get(endpoint);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(allSchemasSchema);
		expect(response.data.block.schema).toStrictEqual(schemas.blockSchema);
		expect(response.data.header.schema).toStrictEqual(schemas.headerSchema);
		expect(response.data.asset.schema).toStrictEqual(schemas.assetSchema);
		expect(response.data.transaction.schema).toStrictEqual(schemas.transactionSchema);
		expect(response.data.event.schema).toStrictEqual(schemas.eventSchema);
		expect(response.data.ccm.schema).toStrictEqual(schemas.ccmSchema);
		expect(response.data.standardEvent.schema).toStrictEqual(schemas.standardEventSchema);

		response.data.messages.forEach(message =>
			expect(message.schema).toStrictEqual(schemas.messageSchema),
		);
	});

	it('should return bad request for invalid param', async () => {
		const response = await api.get(`${endpoint}?invalid_param=invalid_param`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
