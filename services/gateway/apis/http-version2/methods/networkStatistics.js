/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const networkStatisticsSource = require('../../../sources/version2/networkStatistics');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/network/statistics',
	rpcMethod: 'get.network.statistics',
	tags: ['Network'],
	get schema() {
		const networkSchema = {};
		networkSchema[this.swaggerApiPath] = { get: {} };
		networkSchema[this.swaggerApiPath].get.tags = this.tags;
		networkSchema[this.swaggerApiPath].get.summary = 'Requests network statistics\n RPC=> get.network.statistics';
		networkSchema[this.swaggerApiPath].get.description = 'Returns network statistics data';
		networkSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'network statistics info',
				schema: {
					type: 'array',
					items: {
						$ref: '#/definitions/NetworkStatistics',
					},
				},
			},
			404: {
				$ref: '#/responses/notFound',
			},
		};
		return networkSchema;
	},
	source: networkStatisticsSource,
	envelope,
};
