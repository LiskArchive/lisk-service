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
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	blockchainAppsTokenMetadataSchema,
} = require('../../../schemas/api_v3/blockchainAppsTokenMetadataSchema.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getBlockchainAppsTokenMetadata = async (params) => request(wsRpcUrl, 'get.blockchain.apps.meta.tokens', params);

// TODO: Enable test cases once off-chain data is available
xdescribe('get.blockchain.apps.meta.tokens', () => {
	it('returns blockchain applications off-chain metadata for tokens', async () => {
		const response = await getBlockchainAppsTokenMetadata();
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

	it('returns blockchain applications off-chain metadata for tokens with limit=5', async () => {
		const response = await getBlockchainAppsTokenMetadata({ limit: 5 });
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

	it('returns blockchain applications off-chain metadata for tokens with limit=5 and offset=1', async () => {
		const response = await getBlockchainAppsTokenMetadata({ limit: 5, offset: 1 });
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

	it('returns blockchain applications off-chain metadata for tokens with limit=5, offset=1 and sort=name:desc', async () => {
		const response = await getBlockchainAppsTokenMetadata({ limit: 5, offset: 1, sort: 'name:desc' });
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

	it('returns blockchain application off-chain metadata for tokens by chainID', async () => {
		const response = await getBlockchainAppsTokenMetadata({ chainID: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('returns blockchain application off-chain metadata for tokens by name', async () => {
		const response = await getBlockchainAppsTokenMetadata({ name: 'Lisk' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('returns blockchain applications off-chain metadata for tokens by search', async () => {
		const response = await getBlockchainAppsTokenMetadata({ search: 'Lisk' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('returns blockchain applications off-chain metadata for tokens by partial search', async () => {
		const response = await getBlockchainAppsTokenMetadata({ search: 'Lis' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('returns blockchain applications off-chain metadata for tokens by case-insensitive search (Upper-case)', async () => {
		const response = await getBlockchainAppsTokenMetadata({ search: 'LISK' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('returns blockchain applications off-chain metadata for tokens by case-insensitive search (Lower-case)', async () => {
		const response = await getBlockchainAppsTokenMetadata({ search: 'lisk' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('invalid request param -> invalid param', async () => {
		const response = await getBlockchainAppsTokenMetadata({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
