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
const nftEscrowedSource = require('../../../../../sources/version3/nftEscrowed');
const envelope = require('../../../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/nft/escrowed',
	rpcMethod: 'get.nft.escrowed',
	tags: ['NFT'],
	params: {
		escrowedChainID: { optional: true, type: 'string', pattern: regex.CHAIN_ID, altSwaggerKey: 'nftEscrowChainID' },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	get schema() {
		const nftEscrowedSchema = {};
		nftEscrowedSchema[this.swaggerApiPath] = { get: {} };
		nftEscrowedSchema[this.swaggerApiPath].get.tags = this.tags;
		nftEscrowedSchema[this.swaggerApiPath].get.summary = 'Requests escrowed NFT data.';
		nftEscrowedSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns escrowed NFT data.',
		});
		nftEscrowedSchema[this.swaggerApiPath].get.parameters = transformParams('nft', this.params);
		nftEscrowedSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of escrowed NFTs.',
				schema: {
					$ref: '#/definitions/NFTEscrowedWithEnvelope',
				},
			},
		};
		Object.assign(nftEscrowedSchema[this.swaggerApiPath].get.responses, response);
		return nftEscrowedSchema;
	},
	source: nftEscrowedSource,
	envelope,
};
