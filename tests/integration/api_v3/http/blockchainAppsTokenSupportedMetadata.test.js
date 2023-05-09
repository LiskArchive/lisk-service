/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
	blockchainAppsTokenMetadataSchema,
} = require('../../../schemas/api_v3/blockchainAppsTokenMetadataSchema.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/blockchain/apps/meta/tokens/supported`;
const networkStatusEndpoint = `${baseUrlV3}/network/status`;

let curChainID;

describe('Blockchain application supported tokens metadata API', () => {
	beforeAll(async () => {
		const response = await api.get(networkStatusEndpoint);
		curChainID = response.data.chainID;
	});

	it('retrieves blockchain applications off-chain metadata for supported tokens by chainID', async () => {
		const response = await api.get(`${endpoint}?chainID=${curChainID}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications off-chain metadata for supported tokens by chainID and limit=5', async () => {
		const response = await api.get(`${endpoint}?chainID=${curChainID}&limit=5`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(5);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications off-chain metadata for supported tokens by chainID, limit=5 and offset=1', async () => {
		const response = await api.get(`${endpoint}?chainID=${curChainID}&limit=5&offset=1`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(5);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications off-chain metadata for supported tokens by chainID and sort=tokenID:desc', async () => {
		const response = await api.get(`${endpoint}?chainID=${curChainID}&sort=tokenID:desc`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(5);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('invalid request param -> bad request', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('No params -> bad request', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(badRequestSchema);
	});
});
