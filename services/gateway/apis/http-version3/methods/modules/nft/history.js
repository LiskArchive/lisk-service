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
const nftHistorySource = require('../../../../../sources/version3/nftHistory');
const envelope = require('../../../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/nft/history',
	rpcMethod: 'get.nft.history',
	tags: ['NFT'],
	params: {
		nftID: { optional: false, type: 'string', pattern: regex.NFT_ID },
		type: { optional: false, type: 'string', pattern: regex.TYPE },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	get schema() {
		const nftSchema = {};
		nftSchema[this.swaggerApiPath] = { get: {} };
		nftSchema[this.swaggerApiPath].get.tags = this.tags;
		nftSchema[this.swaggerApiPath].get.summary = 'Requests NFT history.';
		nftSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns NFT history.',
		});
		nftSchema[this.swaggerApiPath].get.parameters = transformParams('nft', this.params);
		nftSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns NFT history by type.',
				schema: {
					$ref: '#/definitions/NFTHistoryWithEnvelope',
				},
			},
		};
		Object.assign(nftSchema[this.swaggerApiPath].get.responses, response);
		return nftSchema;
	},
	source: nftHistorySource,
	envelope,
};
