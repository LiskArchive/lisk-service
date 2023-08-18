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

const nftSupportedSource = require('../../../../../sources/version3/nftSupported');
const envelope = require('../../../../../sources/version3/mappings/stdEnvelope');
const { response, getSwaggerDescription } = require('../../../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/nft/supported',
	rpcMethod: 'get.nft.supported',
	tags: ['NFT'],
	get schema() {
		const nftSupportedSchema = {};
		nftSupportedSchema[this.swaggerApiPath] = { get: {} };
		nftSupportedSchema[this.swaggerApiPath].get.tags = this.tags;
		nftSupportedSchema[this.swaggerApiPath].get.summary = 'Requests NFT Module supported collection IDs information.';
		nftSupportedSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Requests supported collection IDs information for the NFT Module.',
		});
		nftSupportedSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns supported collection IDs information for the NFT Modulee.',
				schema: {
					$ref: '#/definitions/nftSupportedWithEnvelope',
				},
			},
		};
		Object.assign(nftSupportedSchema[this.swaggerApiPath].get.responses, response);
		return nftSupportedSchema;
	},
	source: nftSupportedSource,
	envelope,
};
