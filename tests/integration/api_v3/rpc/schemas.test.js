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
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	allSchemasSchema,
	goodRequestSchema,
} = require('../../../schemas/api_v3/allSchemas.schema');

const schemas = require('../../../schemas/api_v3/constants/schemas');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const requestSchemas = async params => request(wsRpcUrl, 'get.schemas', params);

describe('Method get.schemas', () => {
	it('returns list of all available schemas', async () => {
		const response = await requestSchemas({});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data).toMap(allSchemasSchema);
		expect(result.data.block.schema).toStrictEqual(schemas.blockSchema);
		expect(result.data.header.schema).toStrictEqual(schemas.headerSchema);
		expect(result.data.asset.schema).toStrictEqual(schemas.assetSchema);
		expect(result.data.transaction.schema).toStrictEqual(schemas.transactionSchema);
		expect(result.data.event.schema).toStrictEqual(schemas.eventSchema);
	});

	it('returns invalid response for invalid param', async () => {
		const response = await requestSchemas({ invalid_param: 'invalid_param' });
		expect(response).toMap(invalidParamsSchema);
	});
});
