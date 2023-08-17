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
	nftSchema,
} = require('../../../schemas/api_v3/nft.schema');
const { invalidOffsets, invalidLimits, invalidNFTOwner, invalidNFTCollectionID, invalidNFTID, invalidChainID } = require('../constants/invalidInputs');
const { escrowedChainID } = require('../../../../services/gateway/sources/version3/mappings/nft');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getNFTs = async (params) => request(wsRpcUrl, 'get.nft', params);

describe('get.blockchain.apps.meta.list', () => {
	let nftID;
	let nftIndex;
	let nftChainID;
	let nftCollectionID;
	let nftOwner;
	let nftEscrowChainID;

	beforeAll(async () => {
		[{
			id: nftID,
			nft: {
				chainID: nftChainID,
				collectionID: nftCollectionID,
				index: nftIndex,
			},
			owner: nftOwner,
			escrowedChainID: nftEscrowChainID,
		}] = (await getNFTs()).result.data;
	});

	it('should return list of NFTs', async () => {
		const response = await getNFTs();
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(nft => expect(nft).toMap(nftSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return list of NFTs with limit=10', async () => {
		const response = await getNFTs({ limit: 10 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(nft => expect(nft).toMap(nftSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return list of NFTs with limit=10 and offset=1', async () => {
		const response = await getNFTs({ limit: 10, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(0);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(nft => expect(nft).toMap(nftSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return list of NFTs by NFT ID', async () => {
		const response = await getNFTs({ nftID });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		result.data.forEach(nft => expect(nft).toMap(nftSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return list of NFTs by collection ID and chain ID', async () => {
		const response = await getNFTs({ collectionID: nftCollectionID, chainID: nftChainID });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		result.data.forEach(nft => expect(nft).toMap(nftSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return list of NFTs by chain ID', async () => {
		const response = await getNFTs({ chainID: nftChainID });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		result.data.forEach(nft => expect(nft).toMap(nftSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return list of NFTs by NFT index, collectionID and chainID', async () => {
		const response = await getNFTs({
			index: nftIndex,
			collectionID: nftCollectionID,
			chainID: nftChainID,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		result.data.forEach(nft => expect(nft).toMap(nftSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return list of NFTs by NFT owner', async () => {
		const response = await getNFTs({ owner: nftOwner });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		result.data.forEach(nft => expect(nft).toMap(nftSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return list of NFTs by NFT escrowed chain ID', async () => {
		const response = await getNFTs({ escrowChainID: nftEscrowChainID });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		result.data.forEach(nft => expect(nft).toMap(nftSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('should return invalid params for an invalid NFT ID param', async () => {
		for (let i = 0; i < invalidNFTID.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getNFTs({ nftID: invalidNFTID[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for an invalid collection ID and valid chain ID param', async () => {
		for (let i = 0; i < invalidNFTCollectionID.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getNFTs({
				collectionID: invalidNFTCollectionID[i],
				chainID: nftChainID,
			});
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for an invalid chain ID param', async () => {
		for (let i = 0; i < invalidChainID.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getNFTs({ collectionID: invalidChainID[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for an invalid owner param', async () => {
		for (let i = 0; i < invalidNFTOwner.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getNFTs({ owner: invalidNFTOwner[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for an invalid escrow chain ID param', async () => {
		for (let i = 0; i < escrowedChainID.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getNFTs({ collectionID: escrowedChainID[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for an invalid param', async () => {
		const response = await getNFTs({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params for an invalid limit', async () => {
		for (let i = 0; i < invalidLimits.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getNFTs({ limit: invalidLimits[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params for an invalid offset', async () => {
		for (let i = 0; i < invalidOffsets.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getNFTs({ offset: invalidOffsets[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});
});
