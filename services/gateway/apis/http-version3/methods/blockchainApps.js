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
const blockchainAppsSchemaSource = require('../../../sources/version3/blockchainAppsSchema');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/blockchain/apps',
	rpcMethod: 'get.blockchain.apps',
	tags: ['Interoperability'],
	params: {
		chainID: { optional: true, type: 'string', pattern: regex.CHAIN_ID_CSV, altSwaggerKey: 'chainIDCSV' },
		name: { optional: true, type: 'string', min: 1, max: 20, pattern: regex.NAME },
		status: { optional: true, type: 'string', pattern: regex.APPLICATION_STATUS, altSwaggerKey: 'blockchainAppStatus' },
		search: { optional: true, type: 'string', altSwaggerKey: 'blockchainAppSearch' },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	get schema() {
		const blockchainAppsSchema = {};
		blockchainAppsSchema[this.swaggerApiPath] = { get: {} };
		blockchainAppsSchema[this.swaggerApiPath].get.tags = this.tags;
		blockchainAppsSchema[this.swaggerApiPath].get.summary = 'Requests list of blockchain applications';
		blockchainAppsSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns a list of blockchain applications',
		});
		blockchainAppsSchema[this.swaggerApiPath].get.parameters = transformParams('blockchainApps', this.params);
		blockchainAppsSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of blockchain applications in the Lisk ecosystem',
				schema: {
					$ref: '#/definitions/BlockchainAppsWithEnvelope',
				},
			},
		};
		Object.assign(blockchainAppsSchema[this.swaggerApiPath].get.responses, response);
		return blockchainAppsSchema;
	},
	source: blockchainAppsSchemaSource,
	envelope,
};
