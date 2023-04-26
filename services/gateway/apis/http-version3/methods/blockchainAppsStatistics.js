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
const blockchainAppsStatsSchemaSource = require('../../../sources/version3/blockchainAppsStatsSchema');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const { getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/blockchain/apps/statistics',
	rpcMethod: 'get.blockchain.apps.statistics',
	tags: ['Interoperability'],
	params: {},
	get schema() {
		const blockchainAppsStatsSchema = {};
		blockchainAppsStatsSchema[this.swaggerApiPath] = { get: {} };
		blockchainAppsStatsSchema[this.swaggerApiPath].get.tags = this.tags;
		blockchainAppsStatsSchema[this.swaggerApiPath].get.summary = 'Requests blockchain application statistics';
		blockchainAppsStatsSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns blockchain applications statistics',
		});
		blockchainAppsStatsSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns statistics for the blockchain applications in the Lisk ecosystem',
				schema: {
					$ref: '#/definitions/blockchainAppsStatsEnvelope',
				},
			},
		};
		return blockchainAppsStatsSchema;
	},
	source: blockchainAppsStatsSchemaSource,
	envelope,
};
