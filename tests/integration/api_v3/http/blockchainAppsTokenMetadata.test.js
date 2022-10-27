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
	blockchainAppsTokenMetadataSchema,
} = require('../../../schemas/api_v3/blockchainAppsTokenMetadataSchema.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/blockchain/apps/meta/tokens`;

describe('Blockchain application tokens metadata API', () => {
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

	it('retrieves blockchain application off-chain metadata for tokens by global chainID', async () => {
		const response = await api.get(`${endpoint}?chainID=00000001`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('fails validation error when only local chainID specified', async () => {
		const response = await api.get(`${endpoint}?chainID=00000000`, 400);
		expect(response).toMap(badRequestSchema);
		expect(response.message).toInclude('Expected a global chainID, instead received:');
	});

	it('retrieves blockchain application off-chain metadata for tokens by chainName', async () => {
		const response = await api.get(`${endpoint}?chainName=Lisk`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata by tokenID', async () => {
		const response = await api.get(`${endpoint}?tokenID=0000000100000000`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata for tokens by csv tokenID', async () => {
		const response = await api.get(`${endpoint}?network=devnet&tokenID=0400000000000000,0300000000000000`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata for tokens by tokenID and chainID', async () => {
		const response = await api.get(`${endpoint}?tokenID=0000000100000000&chainID=00000001`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata for tokens by local tokenID and global chainID', async () => {
		const response = await api.get(`${endpoint}?tokenID=0000000000000000&chainID=00000001`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('fails validation when local tokenID and local chainID specified', async () => {
		const response = await api.get(`${endpoint}?tokenID=0000000000000000&chainID=00000000`, 400);
		expect(response).toMap(badRequestSchema);
		expect(response.message).toInclude('Expected a global chainID, instead received:');
	});

	it('fails validation error when only local tokenID specified', async () => {
		const response = await api.get(`${endpoint}?tokenID=0000000000000000`, 400);
		expect(response).toMap(badRequestSchema);
		expect(response.message).toInclude('\'chainID\' is required when specifying local tokenID.');
	});

	it('retrieves blockchain application off-chain metadata for tokens by tokenName', async () => {
		const response = await api.get(`${endpoint}?tokenName=Lisk`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata for tokens by csv tokenID', async () => {
		const response = await api.get(`${endpoint}?network=devnet&tokenName=Lik,Lisk&chainID=04000000`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata for tokens by network', async () => {
		const response = await api.get(`${endpoint}?network=testnet`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
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
