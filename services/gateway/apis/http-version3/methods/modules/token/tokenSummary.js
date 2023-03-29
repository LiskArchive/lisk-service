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
const tokenSummarySource = require('../../../../../sources/version3/tokenSummary');
const envelope = require('../../../../../sources/version3/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/token/summary',
	rpcMethod: 'get.token.summary',
	tags: ['Token'],
	params: {},
	get schema() {
		const tokenSummarySchema = {};
		tokenSummarySchema[this.swaggerApiPath] = { get: {} };
		tokenSummarySchema[this.swaggerApiPath].get.tags = this.tags;
		tokenSummarySchema[this.swaggerApiPath].get.summary = 'Requests the tokens summary for the current blockchain application.';
		tokenSummarySchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns the token summary. The \'supportedTokens\' is an empty list when all the tokens are supported on the blockchain application.',
		});
		tokenSummarySchema[this.swaggerApiPath].get.parameters = transformParams('tokens', this.params);
		tokenSummarySchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns the token summary. The \'supportedTokens\' is an empty list when all the tokens are supported on the blockchain application.',
				schema: {
					$ref: '#/definitions/tokenSummaryWithEnvelope',
				},
			},
		};
		Object.assign(tokenSummarySchema[this.swaggerApiPath].get.responses, response);
		return tokenSummarySchema;
	},
	source: tokenSummarySource,
	envelope,
};
