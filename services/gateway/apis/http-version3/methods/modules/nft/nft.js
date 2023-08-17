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
const nftSource = require('../../../../../sources/version3/nft');
const envelope = require('../../../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/nft',
	rpcMethod: 'get.nft',
	tags: ['NFT'],
	params: {
		nftID: { optional: true, type: 'string', pattern: regex.NFT_ID },
		chainID: { optional: true, type: 'string', pattern: regex.CHAIN_ID, altSwaggerKey: 'nftChainID' },
		collectionID: { optional: true, type: 'string', pattern: regex.NFT_COLLECTION_ID, altSwaggerKey: 'nftCollectionID' },
		index: { optional: true, type: 'number', min: 1, altSwaggerKey: 'nftIndex' },
		owner: { optional: true, type: 'string', pattern: regex.NFT_OWNER, altSwaggerKey: 'nftOwner' },
		escrowChainID: { optional: true, type: 'string', pattern: regex.CHAIN_ID, altSwaggerKey: 'nftEscrowChainID' },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	get schema() {
		const nftSchema = {};
		nftSchema[this.swaggerApiPath] = { get: {} };
		nftSchema[this.swaggerApiPath].get.tags = this.tags;
		nftSchema[this.swaggerApiPath].get.summary = 'Requests NFT data.';
		nftSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns NFT data.',
		});
		nftSchema[this.swaggerApiPath].get.parameters = transformParams('nft', this.params);
		nftSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of NFTs.',
				schema: {
					$ref: '#/definitions/NFTsWithEnvelope',
				},
			},
		};
		Object.assign(nftSchema[this.swaggerApiPath].get.responses, response);
		return nftSchema;
	},
	source: nftSource,
	envelope,
};
