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
	resultEnvelopeSchema,
	emptyResultEnvelopeSchema,
	emptyResponseSchema,
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	commandsParamsSchemasSchema,
} = require('../../../schemas/api_v3/commandsParamsSchema.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const requestCommandsParamsSchemas = async params => request(wsRpcUrl, 'get.commands.parameters.schemas', params);

describe('Method get.commands.parameters.schemas', () => {
	it('returns list of all available commands parameters schemas', async () => {
		const response = await requestCommandsParamsSchemas({});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(response.result).toMap(resultEnvelopeSchema);
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		result.data.forEach(schema => expect(schema).toMap(commandsParamsSchemasSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('returns command parameters schema for known moduleCommand', async () => {
		const response = await requestCommandsParamsSchemas({ moduleCommand: 'token:transfer' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(response.result).toMap(resultEnvelopeSchema);
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(schema => expect(schema).toMap(commandsParamsSchemasSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('returns empty response for inexistent moduleCommand', async () => {
		const response = await requestCommandsParamsSchemas({ moduleCommand: 'invalid:name' });
		expect(response).toMap(emptyResponseSchema);
		const { result } = response;
		expect(result).toMap(emptyResultEnvelopeSchema);
	});

	it('returns invalid response for invalid moduleCommand', async () => {
		const response = await requestCommandsParamsSchemas({ moduleCommand: 'invalid_name' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('empty moduleCommand ->  ok', async () => {
		const response = await requestCommandsParamsSchemas({ moduleCommand: '' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(response.result).toMap(resultEnvelopeSchema);
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		result.data.forEach(schema => expect(schema).toMap(commandsParamsSchemasSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('returns invalid response for invalid param', async () => {
		const response = await requestCommandsParamsSchemas({ invalid_param: 'invalid_param' });
		expect(response).toMap(invalidParamsSchema);
	});
});
