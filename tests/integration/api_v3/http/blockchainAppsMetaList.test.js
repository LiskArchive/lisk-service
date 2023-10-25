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
	blockchainAppMetaListSchema,
} = require('../../../schemas/api_v3/blockchainAppsMetaListSchema.schema');
const {
	invalidLimits,
	invalidOffsets,
	invalidPartialSearches,
	invalidNames,
	invalidChainIDCSV,
} = require('../constants/invalidInputs');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/blockchain/apps/meta/list`;

describe('Blockchain application meta list API', () => {
	it('should return blockchain application meta list', async () => {
		const response = await api.get(endpoint);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return blockchain application meta list with limit=10', async () => {
		const response = await api.get(`${endpoint}?limit=10`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return blockchain application meta list with limit=10 and offset=1', async () => {
		const response = await api.get(`${endpoint}?limit=10&offset=1`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return blockchain application meta list with limit=10, offset=1 and sort=chainName:desc', async () => {
		const response = await api.get(`${endpoint}?limit=10&offset=1&sort=chainName:desc`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return blockchain application meta list by chainName', async () => {
		const response = await api.get(`${endpoint}?chainName=lisk_mainchain`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return blockchain application meta list by network', async () => {
		const response = await api.get(`${endpoint}?network=betanet`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return blockchain application meta list by network as CSV', async () => {
		const response = await api.get(`${endpoint}?network=betanet,devnet`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return blockchain applications meta list by search', async () => {
		const response = await api.get(`${endpoint}?search=Lisk`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return blockchain applications meta list by partial search', async () => {
		const response = await api.get(`${endpoint}?search=Lis`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return blockchain applications meta list by case-insensitive search (Upper-case)', async () => {
		const response = await api.get(`${endpoint}?search=LISK`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return blockchain applications meta list by case-insensitive search (Lower-case)', async () => {
		const response = await api.get(`${endpoint}?search=lisk`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(response.meta).toMap(metaSchema);
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

	it('should return bad request for an invalid chainName param', async () => {
		for (let i = 0; i < invalidNames.length; i++) {
			const response = await api.get(`${endpoint}?chainName=${invalidNames[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request for an invalid param', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request for an invalid chainName', async () => {
		const response = await api.get(`${endpoint}?chainName=%^!(*)`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request for an invalid network', async () => {
		const response = await api.get(`${endpoint}?network=gammanet`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request for an invalid search parameter', async () => {
		const response = await api.get(`${endpoint}?search=%^!(*)`, 400);
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

	it('should return bad request for an invalid sort option', async () => {
		const response = await api.get(`${endpoint}?sort=invalidSort`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
