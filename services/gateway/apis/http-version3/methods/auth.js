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
const authSource = require('../../../sources/version3/auth');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/auth',
	rpcMethod: 'get.auth',
	tags: ['Auth'],
	params: {
		address: { optional: false, type: 'string', min: 3, max: 41, pattern: regex.ADDRESS_BASE32 },
	},
	get schema() {
		const authSchema = {};
		authSchema[this.swaggerApiPath] = { get: {} };
		authSchema[this.swaggerApiPath].get.tags = this.tags;
		authSchema[this.swaggerApiPath].get.summary = 'Requests auth account details by address';
		authSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns auth account details by address',
		});
		authSchema[this.swaggerApiPath].get.parameters = transformParams('Auth', this.params);
		authSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Auth account details',
				schema: {
					$ref: '#/definitions/authWithEnvelope',
				},
			},
		};
		Object.assign(authSchema[this.swaggerApiPath].get.responses, response);
		return authSchema;
	},
	source: authSource,
};
