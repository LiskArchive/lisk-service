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
	nftSchema,
} = require('../../../schemas/api_v3/nft.schema');
const { invalidLimits, invalidOffsets, invalidNFTID, invalidNFTCollectionID, invalidNFTOwner } = require('../constants/invalidInputs');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/nft`;

describe('Fetch NFTs API', () => {
	let nftID;
	let nftCollectionID;
	let nftOwner;

	beforeAll(async () => {
		[{
			id: nftID,
			nft: { collectionID: nftCollectionID },
			owner: nftOwner,
		}] = (await api.get(endpoint)).data;
	});

	it('should return list of NFTs', async () => {
		const response = await api.get(endpoint);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(nft => expect(nft).toMap(nftSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return list of NFTs with limit=10', async () => {
		const response = await api.get(`${endpoint}?limit=10`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(nft => expect(nft).toMap(nftSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return list of NFTs with limit=10 and offset=1', async () => {
		const response = await api.get(`${endpoint}?limit=10&offset=1`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(nft => expect(nft).toMap(nftSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return list of NFTs by NFT ID', async () => {
		const response = await api.get(`${endpoint}?nftID=${nftID}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		response.data.map(nft => expect(nft).toMap(nftSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return list of NFTs by Collection ID', async () => {
		const response = await api.get(`${endpoint}?collectionID=${nftCollectionID}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.map(nft => expect(nft).toMap(nftSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return list of NFTs by owner', async () => {
		const response = await api.get(`${endpoint}?owner=${nftOwner}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.map(nft => expect(nft).toMap(nftSchema));
		expect(response.meta).toMap(metaSchema);
	});

	it('should return bad request for an invalid NFT ID param', async () => {
		for (let i = 0; i < invalidNFTID.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await api.get(`${endpoint}?nftID=${invalidNFTID[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request for an invalid Collection ID param', async () => {
		for (let i = 0; i < invalidNFTCollectionID.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await api.get(`${endpoint}?collectionID=${invalidNFTCollectionID[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request for an invalid owner param', async () => {
		for (let i = 0; i < invalidNFTOwner.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await api.get(`${endpoint}?owner=${invalidNFTOwner[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request for an invalid param', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request for an invalid limit', async () => {
		for (let i = 0; i < invalidLimits.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await api.get(`${endpoint}?limit=${invalidLimits[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request for an invalid offset', async () => {
		for (let i = 0; i < invalidOffsets.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await api.get(`${endpoint}?offset=${invalidOffsets[i]}`, 400);
			expect(response).toMap(badRequestSchema);
		}
	});
});
