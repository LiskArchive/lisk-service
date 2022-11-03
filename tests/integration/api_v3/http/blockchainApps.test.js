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
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	blockchainAppSchema,
} = require('../../../schemas/api_v3/blockchainAppsSchema.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/blockchain/apps`;
const networkStatusEndpoint = `${baseUrlV3}/network/status`;

let curChainID;

// TODO: Update test when data is available in blockchain_apps table
describe('Blockchain apps API', () => {
	beforeAll(async () => {
		const response = await api.get(networkStatusEndpoint);
		curChainID = response.data.chainID;
	});

	it('retrieves list of all blockchain applications', async () => {
		const response = await api.get(endpoint);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves list of all blockchain applications with limit=10', async () => {
		const response = await api.get(`${endpoint}?limit=10`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves list of all blockchain applications with limit=10 and offset=1', async () => {
		const response = await api.get(`${endpoint}?limit=10&offset=1`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves list of all default blockchain applications', async () => {
		const response = await api.get(`${endpoint}?isDefault=true`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp)
			.toMap(blockchainAppSchema, { isDefault: true }));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves list of all non-default blockchain applications', async () => {
		const response = await api.get(`${endpoint}?isDefault=false`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp)
			.toMap(blockchainAppSchema, { isDefault: false }));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application by chainID', async () => {
		const response = await api.get(`${endpoint}?chainID=${curChainID}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application by chainID as CSV', async () => {
		const response = await api.get(`${endpoint}?chainID=00000000,${curChainID}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications by status', async () => {
		const response = await api.get(`${endpoint}?status=active`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications by partial search', async () => {
		const response = await api.get(`${endpoint}?search=`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('invalid request param -> bad request', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
