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

const {
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	blockchainAppsTokenMetadataSchema,
} = require('../../../schemas/api_v3/blockchainAppsTokenMetadataSchema.schema');
const { invalidLimits, invalidChainIDCSV, invalidOffsets } = require('../constants/invalidInputs');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getBlockchainAppsTokensSupportedMetadata = async (params) => request(wsRpcUrl, 'get.blockchain.apps.meta.tokens.supported', params);
const getNetworkStatus = async params => request(wsRpcUrl, 'get.network.status', params);

let curChainID;

describe('get.blockchain.apps.meta.tokens.supported', () => {
	beforeAll(async () => {
		const response = await getNetworkStatus();
		curChainID = response.result.data.chainID;
	});

	it('should return blockchain applications off-chain metadata for supported tokens by chainID', async () => {
		const response = await getBlockchainAppsTokensSupportedMetadata({ chainID: curChainID });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('should return blockchain applications off-chain metadata for supported tokens by chainID and limit=5', async () => {
		const response = await getBlockchainAppsTokensSupportedMetadata({
			chainID: curChainID,
			limit: 5,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(5);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('should return blockchain applications off-chain metadata for supported tokens by chainID, limit=5 and offset=1', async () => {
		const response = await getBlockchainAppsTokensSupportedMetadata({
			chainID: curChainID,
			limit: 5,
			offset: 1,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(5);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('should return blockchain applications off-chain metadata for supported tokens by chainID and sort=tokenID:desc', async () => {
		const response = await getBlockchainAppsTokensSupportedMetadata({ chainID: curChainID, sort: 'tokenID:desc' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(5);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('should return invalid params for an invalid param', async () => {
		const response = await getBlockchainAppsTokensSupportedMetadata({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params for missing chainID', async () => {
		const response = await getBlockchainAppsTokensSupportedMetadata();
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params for an invalid chainID param', async () => {
		for (let i = 0; i < invalidChainIDCSV.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getBlockchainAppsTokensSupportedMetadata({
				chainID: invalidChainIDCSV[i],
			});
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for an invalid limit', async () => {
		for (let i = 0; i < invalidLimits.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getBlockchainAppsTokensSupportedMetadata({ limit: invalidLimits[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for an invalid offset', async () => {
		for (let i = 0; i < invalidOffsets.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getBlockchainAppsTokensSupportedMetadata({
				offset: invalidOffsets[i],
			});
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for an invalid sort option', async () => {
		const response = await getBlockchainAppsTokensSupportedMetadata({ sort: 'invalidSort' });
		expect(response).toMap(invalidParamsSchema);
	});
});
