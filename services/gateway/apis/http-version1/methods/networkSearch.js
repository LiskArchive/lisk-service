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

const networkSearchSource = require('../../../sources/version1/networkSearch');
const envelope = require('../../../sources/version1/mappings/stdEnvelope');
const { transformParams, response } = require('../swagger/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/search',
	rpcMethod: 'get.search',
	tags: ['Network'],
	params: {
		q: { optional: false, type: 'string' },
	},
	get schema() {
		const networkSchema = {};
		networkSchema[this.swaggerApiPath] = { get: {} };
		networkSchema[this.swaggerApiPath].get.tags = this.tags;
		networkSchema[this.swaggerApiPath].get.summary = 'Requests result based on search';
		networkSchema[this.swaggerApiPath].get.parameters = transformParams('network', this.params);
		networkSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'result based on search query',
				schema: {
					type: 'array',
					items: {
						$ref: '#/definitions/UnifiedSearch',
					},
				},
			},
		};
		Object.assign(networkSchema[this.swaggerApiPath].get.responses, response);
		return networkSchema;
	},
	source: networkSearchSource,
	envelope,
};
