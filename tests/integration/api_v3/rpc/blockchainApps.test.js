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

const {
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	blockchainAppsSchema,
} = require('../../../schemas/api_v3/blockchainApps.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getBlockchainApps = async (params) => request(wsRpcUrl, 'get.blockchain.apps', params);
const getNetworkStatus = async params => request(wsRpcUrl, 'get.network.status', params);

let curChainID;

// TODO: Update test when data is available in blockchain_apps table
describe('get.blockchain.apps', () => {
	beforeAll(async () => {
		const response = await getNetworkStatus();
		curChainID = response.result.data.chainID;
	});

	it('should return list of all blockchain applications', async () => {
		const response = await getBlockchainApps();
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(blockchainAppsSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of all blockchain applications when called with limit=10', async () => {
		const response = await getBlockchainApps({ limit: 10 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(blockchainAppsSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of all blockchain applications when called with limit=10 and offset=1', async () => {
		const response = await getBlockchainApps({ limit: 10, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(blockchainAppsSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of all blockchain applications when called by valid chainName', async () => {
		const response = await getBlockchainApps({ chainName: 'enevti' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data.length).toEqual(1);
		expect(result).toMap(blockchainAppsSchema);
	});

	it('should return list of all blockchain applications when called by valid chainID', async () => {
		const response = await getBlockchainApps({ chainID: '04000001' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(blockchainAppsSchema);
		expect(result.data.length).toEqual(1);
	});

	it('should return list of all blockchain applications when called by chainIDs as CSV', async () => {
		const response = await getBlockchainApps({ chainID: `04000001,${curChainID}` });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(blockchainAppsSchema);
		expect(result.data.length).toEqual(1);
	});

	it('should return list of all blockchain applications when called by status', async () => {
		const response = await getBlockchainApps({ status: 'registered' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(blockchainAppsSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of all blockchain applications when called by partial search (partial chain name)', async () => {
		const response = await getBlockchainApps({ search: 'ene' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(blockchainAppsSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('should return list of all blockchain applications when called by partial search (exact chain name)', async () => {
		const response = await getBlockchainApps({ search: 'enevti' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(blockchainAppsSchema);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
	});

	it('should return invalid param when called with invalid request param', async () => {
		const response = await getBlockchainApps({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
