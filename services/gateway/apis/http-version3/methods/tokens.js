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
const tokensSource = require('../../../sources/version3/tokens');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/tokens',
	rpcMethod: 'get.tokens',
	tags: ['Tokens'],
	params: {
		address: { optional: false, type: 'string', pattern: regex.ADDRESS_BASE32 },
		tokenID: { optional: true, type: 'string', pattern: regex.TOKEN_ID },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10, pattern: regex.LIMIT },
		offset: { optional: true, type: 'number', min: 0, default: 0, pattern: regex.OFFSET },
	},
	get schema() {
		const tokenSchema = {};
		tokenSchema[this.swaggerApiPath] = { get: {} };
		tokenSchema[this.swaggerApiPath].get.tags = this.tags;
		tokenSchema[this.swaggerApiPath].get.summary = 'Requests tokens information';
		tokenSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns tokens information',
		});
		tokenSchema[this.swaggerApiPath].get.parameters = transformParams('tokens', this.params);
		tokenSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of supported tokens by the blockchain application',
				schema: {
					$ref: '#/definitions/tokenWithEnvelope',
				},
			},
		};
		Object.assign(tokenSchema[this.swaggerApiPath].get.responses, response);
		return tokenSchema;
	},
	source: tokensSource,
	envelope,
};
