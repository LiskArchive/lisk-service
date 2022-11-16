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
	blockchainAppMetadataSchema,
} = require('../../../schemas/api_v3/blockchainAppsMetadataSchema.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/blockchain/apps/meta`;
const networkStatusEndpoint = `${baseUrlV3}/network/status`;

let curChainID;
let curNetwork;

describe('Blockchain applications metadata API', () => {
	beforeAll(async () => {
		const response = await api.get(networkStatusEndpoint);
		curChainID = response.data.chainID;
		curNetwork = CHAIN_ID_PREFIX_NETWORK_MAP[curChainID.substring(0, 2)];
	});

	it('retrieves blockchain applications off-chain metadata', async () => {
		const response = await api.get(endpoint);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetadataSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications off-chain metadata with limit=5', async () => {
		const response = await api.get(`${endpoint}?limit=5`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetadataSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications off-chain metadata with limit=5 and offset=1', async () => {
		const response = await api.get(`${endpoint}?limit=5&offset=1`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetadataSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications off-chain metadata with limit=5, offset=1 and sort=chainName:desc', async () => {
		const response = await api.get(`${endpoint}?limit=5&offset=1&sort=chainName:desc`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetadataSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata by chainID', async () => {
		const response = await api.get(`${endpoint}?chainID=${curChainID}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetadataSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata by chainID as CSV', async () => {
		const response = await api.get(`${endpoint}?chainID=03000000,${curChainID}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(2);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetadataSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata by CSV of chainID and network', async () => {
		const response = await api.get(`${endpoint}?chainID=02000000,03000000,${curChainID}&network=alphanet,${curNetwork}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(2);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetadataSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata by network', async () => {
		const response = await api.get(`${endpoint}?network=${curNetwork}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetadataSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications off-chain metadata by network as CSV', async () => {
		const response = await api.get(`${endpoint}?network=mainnet,testnet,${curNetwork}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(3);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetadataSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata by chainName', async () => {
		const response = await api.get(`${endpoint}?chainName=Lisk`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetadataSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata by search', async () => {
		const response = await api.get(`${endpoint}?search=Lisk`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetadataSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain applications off-chain metadata by partial search', async () => {
		const response = await api.get(`${endpoint}?search=Lis`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetadataSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata by case-insensitive search (Upper-case)', async () => {
		const response = await api.get(`${endpoint}?search=LISK`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetadataSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata by case-insensitive search (Lower-case)', async () => {
		const response = await api.get(`${endpoint}?search=lisk`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetadataSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves list of all default blockchain applications metadata', async () => {
		const response = await api.get(`${endpoint}?isDefault=true`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainAppMetadata => expect(blockchainAppMetadata)
			.toMap(blockchainAppMetadataSchema), { isDefault: true });
		expect(response.meta).toMap(metaSchema);
	});

	it('retrieves list of all non-default blockchain applications metadata', async () => {
		const response = await api.get(`${endpoint}?isDefault=false`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(blockchainAppMetadata => expect(blockchainAppMetadata)
			.toMap(blockchainAppMetadataSchema), { isDefault: false });
		expect(response.meta).toMap(metaSchema);
	});

	it('invalid request param -> bad request', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
