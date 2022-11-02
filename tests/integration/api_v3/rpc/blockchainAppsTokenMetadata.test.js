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
const { CHAIN_ID_PREFIX_NETWORK_MAP } = require('../../../../services/blockchain-app-registry/config');

const {
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
	emptyResponseSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	blockchainAppsTokenMetadataSchema,
} = require('../../../schemas/api_v3/blockchainAppsTokenMetadataSchema.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getBlockchainAppsTokenMetadata = async (params) => request(wsRpcUrl, 'get.blockchain.apps.meta.tokens', params);
const getNetworkStatus = async params => request(wsRpcUrl, 'get.network.status', params);

let curChainID;
let curNetwork;
let defaultToken;

describe('get.blockchain.apps.meta.tokens', () => {
	beforeAll(async () => {
		const response = await getNetworkStatus();
		curChainID = response.result.data.chainID;
		curNetwork = CHAIN_ID_PREFIX_NETWORK_MAP[curChainID.substring(0, 2)];
		defaultToken = `${curChainID}00000000`;
	});

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

	it('returns blockchain applications off-chain metadata for tokens with limit=5, offset=1 and sort=chainName:desc', async () => {
		const response = await getBlockchainAppsTokenMetadata({ limit: 5, offset: 1, sort: 'chainName:desc' });
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
		const response = await getBlockchainAppsTokenMetadata({ chainID: curChainID });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('returns blockchain application off-chain metadata for tokens by chainName', async () => {
		const response = await getBlockchainAppsTokenMetadata({ chainName: 'Lisk' });
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

	it('returns blockchain application off-chain metadata for tokens by tokenID', async () => {
		const response = await getBlockchainAppsTokenMetadata({ tokenID: defaultToken });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata for tokens by csv tokenID', async () => {
		const response = await getBlockchainAppsTokenMetadata({ tokenID: `${defaultToken},0300000000000000` });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(2);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata for tokens by tokenID and chainID', async () => {
		const response = await getBlockchainAppsTokenMetadata({
			tokenID: defaultToken,
			chainID: curChainID,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(1);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('returns blockchain application off-chain metadata for tokens by tokenName and chainID', async () => {
		const response = await getBlockchainAppsTokenMetadata({ tokenName: 'Lisk', chainID: curChainID });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(1);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('returns blockchain application off-chain metadata for tokens by tokenName and tokenID', async () => {
		const response = await getBlockchainAppsTokenMetadata({ tokenName: 'Lisk', tokenID: defaultToken });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(1);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('returns blockchain application off-chain metadata for tokens by chainID and csv tokenName', async () => {
		const response = await getBlockchainAppsTokenMetadata({ chainID: curChainID, tokenName: 'Lik,Lisk' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(1);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('fails validation when only tokenName specified', async () => {
		const response = await getBlockchainAppsTokenMetadata({ tokenName: 'Lisk' });
		expect(response).toMap(emptyResponseSchema);
	});

	it('fails validation when only tokenName and chainName specified', async () => {
		const response = await getBlockchainAppsTokenMetadata({ tokenName: 'Lisk', chainName: curNetwork });
		expect(response).toMap(emptyResponseSchema);
	});

	it('returns blockchain application off-chain metadata for tokens by network', async () => {
		const response = await getBlockchainAppsTokenMetadata({ network: curNetwork });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(blockchainAppsTokenMetadata => {
			expect(blockchainAppsTokenMetadata).toMap(blockchainAppsTokenMetadataSchema);
		});
		expect(result.meta).toMap(metaSchema);
	});

	it('retrieves blockchain application off-chain metadata for tokens by csv network', async () => {
		const response = await getBlockchainAppsTokenMetadata({ network: `${curNetwork},alphanet` });
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

	it('returns blockchain applications off-chain metadata for tokens by search', async () => {
		const response = await getBlockchainAppsTokenMetadata({ search: 'Lisk' });
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

	it('returns blockchain applications off-chain metadata for tokens by partial search', async () => {
		const response = await getBlockchainAppsTokenMetadata({ search: 'Lis' });
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

	it('returns blockchain applications off-chain metadata for tokens by case-insensitive search (Upper-case)', async () => {
		const response = await getBlockchainAppsTokenMetadata({ search: 'LISK' });
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

	it('returns blockchain applications off-chain metadata for tokens by case-insensitive search (Lower-case)', async () => {
		const response = await getBlockchainAppsTokenMetadata({ search: 'lisk' });
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

	it('invalid request param -> invalid param', async () => {
		const response = await getBlockchainAppsTokenMetadata({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
