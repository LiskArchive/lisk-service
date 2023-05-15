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

describe('Blockchain apps API', () => {
	beforeAll(async () => {
		const response = await api.get(networkStatusEndpoint);
		curChainID = response.data.chainID;
	});

	it('should return list of all blockchain applications', async () => {
		const response = await api.get(endpoint);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return list of all blockchain applications when called with limit=10', async () => {
		const response = await api.get(`${endpoint}?limit=10`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return list of all blockchain applications when called with limit=10 and offset=1', async () => {
		const response = await api.get(`${endpoint}?limit=10&offset=1`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return blockchain application when called by valid chainName', async () => {
		const response = await api.get(`${endpoint}?chainName=enevti`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return blockchain application when called by valid chainID', async () => {
		const response = await api.get(`${endpoint}?chainID=04000001`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return blockchain application when called by valid chainIDs as CSV', async () => {
		const response = await api.get(`${endpoint}?chainID=04000001,${curChainID}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return blockchain applications when called by status', async () => {
		const response = await api.get(`${endpoint}?status=registered`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return blockchain applications when called by partial search', async () => {
		const response = await api.get(`${endpoint}?search=`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return bad request when called with invalid request param', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
