/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const networkStatusSource = require('../../../sources/version2/networkStatus');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/network/status',
	rpcMethod: 'get.network.status',
	tags: ['Network'],
	get schema() {
		const networkSchema = {};
		networkSchema[this.swaggerApiPath] = { get: {} };
		networkSchema[this.swaggerApiPath].get.tags = this.tags;
		networkSchema[this.swaggerApiPath].get.summary = 'Requests network status';
		networkSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'network status info',
				schema: {
					type: 'array',
					items: {
						$ref: '#/definitions/NetworkStatus',
					},
				},
			},
			404: {
				$ref: '#/responses/notFound',
			},
		};
		return networkSchema;
	},
	source: networkStatusSource,
};
