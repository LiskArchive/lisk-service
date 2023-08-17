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
	goodRequestSchemaForValidator,
	validatorInfoSchema,
	validatorMetaSchema,
} = require('../../../schemas/api_v3/validatorSchema.schema');

const {
	invalidAddresses,
} = require('../constants/invalidInputs');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/validator`;

describe('Validator API', () => {
	let refGenerator;
	beforeAll(async () => {
		const response = await api.get(`${baseUrlV3}/generators?limit=1`);
		[refGenerator] = response.data;
	});

	it('should return validator info', async () => {
		const response = await api.get(`${endpoint}?address=${refGenerator.address}`);
		expect(response).toMap(goodRequestSchemaForValidator);
		expect(response.data).toMap(validatorInfoSchema);
		expect(response.meta).toMap(validatorMetaSchema);
	});

	it('should return bad request when requested without address', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request when requested with invalid address', async () => {
		for (let i = 0; i < invalidAddresses.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await api.get(`${endpoint}?address=${invalidAddresses[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request when requested with address CSV', async () => {
		const response = await api.get(`${endpoint}?address=${refGenerator.address},${refGenerator.address}`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request when requested with invalid param', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request when requested with empty invalid param', async () => {
		const response = await api.get(`${endpoint}?invalidParam=`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
