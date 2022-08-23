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
const supportedTokensSource = require('../../../sources/version3/supportedTokens');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/tokens/supported',
	rpcMethod: 'get.tokens.supported',
	tags: ['Tokens'],
	params: {
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	get schema() {
		const SupportedTokenSchema = {};
		SupportedTokenSchema[this.swaggerApiPath] = { get: {} };
		SupportedTokenSchema[this.swaggerApiPath].get.tags = this.tags;
		SupportedTokenSchema[this.swaggerApiPath].get.summary = 'Requests supported tokens information';
		SupportedTokenSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns supported tokens information. The \'supportedTokens\' is an empty list when all the tokens are supported on the blockchain application.',
		});
		SupportedTokenSchema[this.swaggerApiPath].get.parameters = transformParams('tokens', this.params);
		SupportedTokenSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns supported tokens information. The \'supportedTokens\' is an empty list when all the tokens are supported on the blockchain application.',
				schema: {
					$ref: '#/definitions/supportedTokenWithEnvelope',
				},
			},
		};
		Object.assign(SupportedTokenSchema[this.swaggerApiPath].get.responses, response);
		return SupportedTokenSchema;
	},
	source: supportedTokensSource,
	envelope,
};
