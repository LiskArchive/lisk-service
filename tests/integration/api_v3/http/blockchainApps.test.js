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

const { blockchainAppsSchema } = require('../../../schemas/api_v3/blockchainApps.schema');
const {
	invalidOffsets,
	invalidLimits,
	invalidPartialSearches,
	invalidChainIDCSV,
	invalidNames,
} = require('../constants/invalidInputs');

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
		expect(response).toMap(blockchainAppsSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of all blockchain applications when called with limit=10', async () => {
		const response = await api.get(`${endpoint}?limit=10`);
		expect(response).toMap(blockchainAppsSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of all blockchain applications when called with limit=10 and offset=1', async () => {
		const response = await api.get(`${endpoint}?limit=10&offset=1`);
		expect(response).toMap(blockchainAppsSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('should return blockchain application when called by valid chainName', async () => {
		const response = await api.get(`${endpoint}?chainName=enevti`);
		expect(response).toMap(blockchainAppsSchema);
		expect(response.data.length).toEqual(1);
	});

	it('should return blockchain application when called by valid chainID', async () => {
		const response = await api.get(`${endpoint}?chainID=04000001`);
		expect(response).toMap(blockchainAppsSchema);
		expect(response.data.length).toEqual(1);
	});

	it('should return blockchain application when called by valid chainIDs as CSV', async () => {
		const response = await api.get(`${endpoint}?chainID=04000001,${curChainID}`);
		expect(response).toMap(blockchainAppsSchema);
		expect(response.data.length).toEqual(1);
	});

	it('should return blockchain applications when called by status', async () => {
		const response = await api.get(`${endpoint}?status=registered`);
		expect(response).toMap(blockchainAppsSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('should return blockchain applications when called by partial search (partial chain name)', async () => {
		const response = await api.get(`${endpoint}?search=ene`);
		expect(response).toMap(blockchainAppsSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('should return blockchain applications when called by partial search (exact chain name)', async () => {
		const response = await api.get(`${endpoint}?search=enevti`);
		expect(response).toMap(blockchainAppsSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('should return status 200 and a valid response for a valid status and search parameter', async () => {
		const response = await api.get(`${endpoint}?status=registered&search=enevti`);
		expect(response).toMap(blockchainAppsSchema);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
	});

	it('should return bad request for an invalid search param', async () => {
		for (let i = 0; i < invalidPartialSearches.length; i++) {
			const response = await api.get(`${endpoint}?search=${invalidPartialSearches[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request for an invalid chainID param', async () => {
		for (let i = 0; i < invalidChainIDCSV.length; i++) {
			const response = await api.get(`${endpoint}?chainID=${invalidChainIDCSV[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request for an invalid chain name param', async () => {
		for (let i = 0; i < invalidNames.length; i++) {
			const response = await api.get(`${endpoint}?chainName=${invalidNames[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request when called with invalid request param', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request for an invalid chainName', async () => {
		const response = await api.get(`${endpoint}?chainName=%^&(!&)`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request for chainName more than 20 characters', async () => {
		const response = await api.get(`${endpoint}?chainName=llisk_mainchain_used_for_testingi`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request for chainName less than 3 characters', async () => {
		const response = await api.get(`${endpoint}?chainName=li`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request for an invalid status', async () => {
		const response = await api.get(`${endpoint}?status=invalidStatus`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request for an invalid limit', async () => {
		for (let i = 0; i < invalidLimits.length; i++) {
			const response = await api.get(`${endpoint}?limit=${invalidLimits[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request for an invalid offset', async () => {
		for (let i = 0; i < invalidOffsets.length; i++) {
			const response = await api.get(`${endpoint}?offset=${invalidOffsets[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});
});
