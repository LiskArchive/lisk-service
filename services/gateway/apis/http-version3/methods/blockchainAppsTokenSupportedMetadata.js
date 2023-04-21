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
const blockchainAppsTokensSupportedMetadataSource = require('../../../sources/version3/blockchainAppsTokenSupportedMetadataSchema');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/blockchain/apps/meta/tokens/supported',
	rpcMethod: 'get.blockchain.apps.meta.tokens.supported',
	tags: ['Application Metadata'],
	params: {
		chainID: { optional: false, type: 'string', pattern: regex.CHAIN_ID },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: ['tokenID:asc', 'tokenID:desc'],
			default: 'tokenID:asc',
		},
	},
	get schema() {
		const endpointSchema = {};
		endpointSchema[this.swaggerApiPath] = { get: {} };
		endpointSchema[this.swaggerApiPath].get.tags = this.tags;
		endpointSchema[this.swaggerApiPath].get.summary = 'Requests blockchain applications off-chain metadata for tokens supported on the specified chainID.';
		endpointSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns blockchain applications off-chain metadata for tokens supported on the specified chainID.',
		});
		endpointSchema[this.swaggerApiPath].get.parameters = transformParams('blockchainAppsTokensSupportedMeta', this.params);
		endpointSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of blockchain applications off-chain metadata for tokens supported on the specified chainID.',
				schema: {
					$ref: '#/definitions/BlockchainAppsTokenMetadataWithEnvelope',
				},
			},
		};
		Object.assign(endpointSchema[this.swaggerApiPath].get.responses, response);
		return endpointSchema;
	},
	source: blockchainAppsTokensSupportedMetadataSource,
	envelope,
};
