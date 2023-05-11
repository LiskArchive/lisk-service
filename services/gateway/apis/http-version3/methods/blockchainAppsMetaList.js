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
const blockchainAppsMetaListSchemaSource = require('../../../sources/version3/blockchainAppsMetaListSchema');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/blockchain/apps/meta/list',
	rpcMethod: 'get.blockchain.apps.meta.list',
	tags: ['Application Off-Chain Metadata'],
	params: {
		chainName: { optional: true, type: 'string', min: 1, max: 20, pattern: regex.NAME },
		network: { optional: true, type: 'string', min: 1, pattern: regex.NETWORK_CSV },
		search: { optional: true, type: 'string', pattern: regex.PARTIAL_SEARCH_NAME, altSwaggerKey: 'searchByChainName' },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: ['chainName:asc', 'chainName:desc'],
			default: 'chainName:asc',
		},
	},
	get schema() {
		const blockchainAppsMetaListSchema = {};
		blockchainAppsMetaListSchema[this.swaggerApiPath] = { get: {} };
		blockchainAppsMetaListSchema[this.swaggerApiPath].get.tags = this.tags;
		blockchainAppsMetaListSchema[this.swaggerApiPath].get.summary = 'Requests list of blockchain applications for which the off-chain metadata is available';
		blockchainAppsMetaListSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns a list of blockchain applications for which the off-chain metadata is available',
		});
		blockchainAppsMetaListSchema[this.swaggerApiPath].get.parameters = transformParams('blockchainAppsMetaList', this.params);
		blockchainAppsMetaListSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of blockchain applications for which the off-chain metadata is available',
				schema: {
					$ref: '#/definitions/BlockchainAppsMetaListWithEnvelope',
				},
			},
		};
		Object.assign(blockchainAppsMetaListSchema[this.swaggerApiPath].get.responses, response);
		return blockchainAppsMetaListSchema;
	},
	source: blockchainAppsMetaListSchemaSource,
	envelope,
};
