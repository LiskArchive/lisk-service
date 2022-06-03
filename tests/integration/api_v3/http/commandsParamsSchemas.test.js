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
	goodRequestSchema,
	badRequestSchema,
	notFoundSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	commandsParamsSchemasSchema,
} = require('../../../schemas/api_v3/commandsParamsSchema.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV2}/commands/parameters/schemas`;

describe('Commands parameters Schemas API', () => {
	describe('Retrieve commands parameters schemas', () => {
		it('returns list of all available commands parameters schemas', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(schema => expect(schema).toMap(commandsParamsSchemasSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns command parameters schema for known moduleCommandID', async () => {
			const response = await api.get(`${endpoint}?moduleCommandID=2:0`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(1);
			response.data.forEach(schema => expect(schema)
				.toMap(
					commandsParamsSchemasSchema,
					{ moduleCommandID: '2:0', moduleCommandName: 'token:transfer' },
				));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns command parameters with known moduleCommandName', async () => {
			const response = await api.get(`${endpoint}?moduleCommandName=token:transfer`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(1);
			response.data.forEach(schema => expect(schema)
				.toMap(
					commandsParamsSchemasSchema,
					{ moduleCommandID: '2:0', moduleCommandName: 'token:transfer' },
				));
			expect(response.meta).toMap(metaSchema);
		});

		it('inexistent moduleCommandID -> 404', async () => {
			const response = await api.get(`${endpoint}?moduleCommandID=-124:999`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('invalid moduleCommandID -> 400', async () => {
			const response = await api.get(`${endpoint}?moduleCommandID=-124`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('empty moduleCommandID ->  ok', async () => {
			const response = await api.get(`${endpoint}?moduleCommandID=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(schema => expect(schema).toMap(commandsParamsSchemasSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('inexistent moduleCommandName -> 404', async () => {
			const response = await api.get(`${endpoint}?moduleCommandName=inexistent:name`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('invalid moduleCommandName -> 400', async () => {
			const response = await api.get(`${endpoint}?moduleCommandName=invalid_name`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('empty moduleCommandName ->  ok', async () => {
			const response = await api.get(`${endpoint}?moduleCommandName=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(schema => expect(schema).toMap(commandsParamsSchemasSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid param -> 400', async () => {
			const response = await api.get(`${endpoint}?invalid_param=invalid_param`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});
});
