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
const forgersSource = require('../../../sources/version2/forgers');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');
const { transformParams, response } = require('../../swagger/utils');

module.exports = {
    version: '2.0',
    swaggerApiPath: '/forgers',
    rpcMethod: 'get.forgers',
    params: {
        limit: { optional: true, min: 1, max: 103, type: 'number', default: 103 },
        offset: { optional: true, min: 0, type: 'number', default: 0 },
    },
    tags: ['Forgers'],
    get schema() {
		const forgerSchema = {};
		forgerSchema[this.swaggerApiPath] = { get: {} };
		forgerSchema[this.swaggerApiPath].get.tags = this.tags;
		forgerSchema[this.swaggerApiPath].get.summary = 'Requests next forgers list';
		forgerSchema[this.swaggerApiPath].get.description = 'Returns forgers list \n RPC=> get.forgers';
		forgerSchema[this.swaggerApiPath].get.parameters = transformParams('forgers', this.params);
		forgerSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'list of next forgers',
				schema: {
					type: 'array',
					items: {
						$ref: '#/definitions/forgers',
					},
				},
			},
		};
		Object.assign(forgerSchema[this.swaggerApiPath].get.responses, response);
		return forgerSchema;
	},
    source: forgersSource,
    envelope,
};
