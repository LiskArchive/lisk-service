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
const { CHAIN_ID_PREFIX_NETWORK_MAP } = require('../../../../services/blockchain-app-registry/config');

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
const endpoint = `${baseUrlV3}/blockchain/apps/meta/tokens`;
const networkStatusEndpoint = `${baseUrlV3}/network/status`;

let curChainID;
let curNetwork;
let defaultToken;

describe('Blockchain application tokens metadata API', () => {
	beforeAll(async () => {
		const response = await api.get(networkStatusEndpoint);
		curChainID = response.data.chainID;
		curNetwork = CHAIN_ID_PREFIX_NETWORK_MAP[curChainID.substring(0, 2)];
		defaultToken = `${curChainID}00000000`;
	});

	it('retrieves blockchain applications off-chain metadata for tokens', async () => {
		const response = await api.get(endpoint);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications off-chain metadata for tokens with limit=5', async () => {
		const response = await api.get(`${endpoint}?limit=5`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(5);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications off-chain metadata for tokens with limit=5 and offset=1', async () => {
		const response = await api.get(`${endpoint}?limit=5&offset=1`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(5);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications off-chain metadata for tokens with limit=5, offset=1 and sort=chainName:desc', async () => {
		const response = await api.get(`${endpoint}?limit=5&offset=1&sort=chainName:desc`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(5);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata for tokens chainID', async () => {
		const response = await api.get(`${endpoint}?chainID=${curChainID}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata for tokens by chainName', async () => {
		const response = await api.get(`${endpoint}?chainName=Lisk`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata by tokenID', async () => {
		const response = await api.get(`${endpoint}?tokenID=${defaultToken}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata for tokens by csv tokenID', async () => {
		const response = await api.get(`${endpoint}?tokenID=${defaultToken},0300000000000000`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(2);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata for tokens by tokenID and chainID', async () => {
		const response = await api.get(`${endpoint}?tokenID=${defaultToken}&chainID=${curChainID}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(1);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata for tokens by tokenName and chainID', async () => {
		const response = await api.get(`${endpoint}?tokenName=Lisk&chainID=${curChainID}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(1);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata for tokens by tokenName and tokenID', async () => {
		const response = await api.get(`${endpoint}?tokenName=Lisk&tokenID=${defaultToken}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(1);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata for tokens by chainID and csv tokenName', async () => {
		const response = await api.get(`${endpoint}?network=${curNetwork}&tokenName=Lik,Lisk&chainID=${curChainID}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(1);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('fails validation error when only tokenName specified', async () => {
		const response = await api.get(`${endpoint}?tokenName=Lisk`, 400);
		expect(response).toMap(badRequestSchema);
		expect(response.message).toInclude('\'tokenName\' must be specified with either \'chainID\', or \'chainName\' and \'network\'.');
	});

	it('fails validation error when only tokenName and chainName specified', async () => {
		const response = await api.get(`${endpoint}?tokenName=Lisk&chainName=${curNetwork}`, 400);
		expect(response).toMap(badRequestSchema);
		expect(response.message).toInclude('\'tokenName\' must be specified with either \'chainID\', or \'chainName\' and \'network\'.');
	});

	it('retrieves blockchain application off-chain metadata for tokens by network', async () => {
		const response = await api.get(`${endpoint}?network=${curNetwork}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata for tokens by csv network', async () => {
		const response = await api.get(`${endpoint}?network=${curNetwork},alphanet`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications off-chain metadata for tokens by search', async () => {
		const response = await api.get(`${endpoint}?search=Lisk`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications off-chain metadata for tokens by partial search', async () => {
		const response = await api.get(`${endpoint}?search=Lis`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications off-chain metadata for tokens by case-insensitive search (Upper-case)', async () => {
		const response = await api.get(`${endpoint}?search=LISK`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications off-chain metadata for tokens by case-insensitive search (Lower-case)', async () => {
		const response = await api.get(`${endpoint}?search=lisk`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('invalid request param -> bad request', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
