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
const blockchainAppsTokenMetadataSchemaSource = require('../../../sources/version3/blockchainAppsTokenMetadataSchema');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/blockchain/apps/meta/tokens',
	rpcMethod: 'get.blockchain.apps.meta.tokens',
	tags: ['Interoperability'],
	params: {
		chainName: { optional: true, type: 'string', pattern: regex.NAME },
		chainID: { optional: true, type: 'string', pattern: regex.CHAIN_ID },
		tokenName: { optional: true, type: 'string', pattern: regex.NAME_CSV },
		tokenID: { optional: true, type: 'string', pattern: regex.TOKENID_CSV },
		network: { optional: false, type: 'string', min: 1, default: 'mainnet', enum: ['mainnet', 'testnet', 'betanet', 'alphanet', 'devnet'] },
		search: { optional: true, type: 'string' },
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
		const blockchainAppsTokenMetadataSchema = {};
		blockchainAppsTokenMetadataSchema[this.swaggerApiPath] = { get: {} };
		blockchainAppsTokenMetadataSchema[this.swaggerApiPath].get.tags = this.tags;
		blockchainAppsTokenMetadataSchema[this.swaggerApiPath].get.summary = 'Requests blockchain applications off-chain metadata for tokens';
		blockchainAppsTokenMetadataSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns blockchain applications off-chain metadata for tokens',
		});
		blockchainAppsTokenMetadataSchema[this.swaggerApiPath].get.parameters = transformParams('blockchainAppsMetaList', this.params);
		blockchainAppsTokenMetadataSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of blockchain applications off-chain metadata for tokens',
				schema: {
					$ref: '#/definitions/BlockchainAppsTokenMetadataWithEnvelope',
				},
			},
		};
		Object.assign(blockchainAppsTokenMetadataSchema[this.swaggerApiPath].get.responses, response);
		return blockchainAppsTokenMetadataSchema;
	},
	source: blockchainAppsTokenMetadataSchemaSource,
	envelope,
};
