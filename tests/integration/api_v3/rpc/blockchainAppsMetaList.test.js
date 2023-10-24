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

const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	blockchainAppMetaListSchema,
} = require('../../../schemas/api_v3/blockchainAppsMetaListSchema.schema');
const {
	invalidOffsets,
	invalidLimits,
	invalidPartialSearches,
	invalidNames,
	invalidChainIDCSV,
} = require('../constants/invalidInputs');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getBlockchainApps = async params =>
	request(wsRpcUrl, 'get.blockchain.apps.meta.list', params);

describe('get.blockchain.apps.meta.list', () => {
	it('should return blockchain applications meta list', async () => {
		const response = await getBlockchainApps();
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return blockchain applications meta list with limit=10', async () => {
		const response = await getBlockchainApps({ limit: 10 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return blockchain applications meta list with limit=10 and offset=1', async () => {
		const response = await getBlockchainApps({ limit: 10, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return blockchain applications meta list with limit=10, offset=1 and sort=chainName:desc', async () => {
		const response = await getBlockchainApps({ limit: 10, offset: 1, sort: 'chainName:desc' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return blockchain applications meta list by chainName', async () => {
		const response = await getBlockchainApps({ chainName: 'lisk_mainchain' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return blockchain applications meta list by network', async () => {
		const response = await getBlockchainApps({ network: 'betanet' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return blockchain applications meta list by network as CSV', async () => {
		const response = await getBlockchainApps({ network: 'betanet,devnet' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return blockchain applications meta list by partial search', async () => {
		const response = await getBlockchainApps({ search: 'Lis' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return blockchain applications meta list by search', async () => {
		const response = await getBlockchainApps({ search: 'Lisk' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return blockchain applications meta list by case-insensitive search (Upper-case)', async () => {
		const response = await getBlockchainApps({ search: 'LISK' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return blockchain applications meta list by case-insensitive search (Lower-case)', async () => {
		const response = await getBlockchainApps({ search: 'lisk' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return invalid params for an invalid search param', async () => {
		for (let i = 0; i < invalidPartialSearches.length; i++) {
			const response = await getBlockchainApps({ search: invalidPartialSearches[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for an invalid chainID param', async () => {
		for (let i = 0; i < invalidChainIDCSV.length; i++) {
			const response = await getBlockchainApps({ chainID: invalidChainIDCSV[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for an invalid chainName param', async () => {
		for (let i = 0; i < invalidNames.length; i++) {
			const response = await getBlockchainApps({ chainName: invalidNames[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for an invalid param', async () => {
		const response = await getBlockchainApps({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params for an invalid chainName', async () => {
		const response = await getBlockchainApps({ chainName: '%^!(*)' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params for an invalid network', async () => {
		const response = await getBlockchainApps({ network: 'gammanet' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params for an invalid search parameter', async () => {
		const response = await getBlockchainApps({ search: '%^!(*)' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params for an invalid limit', async () => {
		for (let i = 0; i < invalidLimits.length; i++) {
			const response = await getBlockchainApps({ limit: invalidLimits[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for an invalid offset', async () => {
		for (let i = 0; i < invalidOffsets.length; i++) {
			const response = await getBlockchainApps({ offset: invalidOffsets[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for an invalid sort option', async () => {
		const response = await getBlockchainApps({ sort: 'invalidSort' });
		expect(response).toMap(invalidParamsSchema);
	});
});
