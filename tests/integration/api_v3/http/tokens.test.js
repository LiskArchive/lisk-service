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
} = require('../../../schemas/api_v3/tokens.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/tokens`;

describe('Tokens API', () => {
	let refValidator;
	let currTokenID;

	beforeAll(async () => {
		const validators = await api.get(`${baseUrlV3}/pos/validators`);
		[refValidator] = validators.data;

		const networkStatus = await api.get(`${baseUrlV3}/network/status`);
		currTokenID = networkStatus.data.chainID.substring(0, 2).padEnd(16, '0');
	});
	it('retrieves tokens info when call with address-> ok', async () => {
		const response = await api.get(`${endpoint}?address=${refValidator.address}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(tokenEntry => expect(tokenEntry).toMap(tokensSchema));
		expect(response.meta).toMap(tokensMetaSchema);
	});

	it('retrieves token info when call with address and limit 10-> ok', async () => {
		const response = await api.get(`${endpoint}?address=${refValidator.address}&limit=10`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(tokenEntry => expect(tokenEntry).toMap(tokensSchema));
		expect(response.meta).toMap(tokensMetaSchema);
	});

	it('retrieves token info when call with address, limit=10 and offset=1-> ok', async () => {
		const response = await api.get(`${endpoint}?address=${refValidator.address}&limit=10&offset=1`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(tokenEntry => expect(tokenEntry).toMap(tokensSchema));
		expect(response.meta).toMap(tokensMetaSchema);
	});

	it('retrieves token info when call with address and tokenID-> ok', async () => {
		const response = await api.get(`${endpoint}?address=${refValidator.address}&tokenID=${currTokenID}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.forEach(tokenEntry => expect(tokenEntry).toMap(tokensSchema));
		expect(response.meta).toMap(tokensMetaSchema);
	});

	it('No address -> bad request', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('invalid request param: TtkenID with NO address -> bad request', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('invalid request param -> bad request', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
