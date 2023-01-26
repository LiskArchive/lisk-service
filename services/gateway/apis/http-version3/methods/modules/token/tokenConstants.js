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

const tokenConstantsSource = require('../../../../../sources/version3/tokenConstants');
const envelope = require('../../../../../sources/version3/mappings/stdEnvelope');
const { response, getSwaggerDescription } = require('../../../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/token/constants',
	rpcMethod: 'get.token.constants',
	tags: ['Tokens'],
	get schema() {
		const constantsSchema = {};
		constantsSchema[this.swaggerApiPath] = { get: {} };
		constantsSchema[this.swaggerApiPath].get.tags = this.tags;
		constantsSchema[this.swaggerApiPath].get.summary = 'Requests token Module Constants.';
		constantsSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Requests all the configured constants for the token module.',
		});
		constantsSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns all the configured constants for the token module.',
				schema: {
					$ref: '#/definitions/tokenConstantsWithEnvelope',
				},
			},
		};
		Object.assign(constantsSchema[this.swaggerApiPath].get.responses, response);
		return constantsSchema;
	},
	source: tokenConstantsSource,
	envelope,
};
