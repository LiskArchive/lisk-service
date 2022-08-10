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
const topAccountsSource = require('../../../sources/version3/topAccounts');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/tokens/lsk/top',
	rpcMethod: 'get.tokens.lsk.top',
	tags: ['Tokens'],
	params: {
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: ['balance:asc', 'balance:desc'],
			default: 'balance:desc',
		},
	},
	get schema() {
		const topAccountsSchema = {};
		topAccountsSchema[this.swaggerApiPath] = { get: {} };
		topAccountsSchema[this.swaggerApiPath].get.tags = this.tags;
		topAccountsSchema[this.swaggerApiPath].get.summary = 'Requests list of addresses with the highest LSK balance on the chain';
		topAccountsSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns list of addresses with the highest LSK balance on the chain',
		});
		topAccountsSchema[this.swaggerApiPath].get.parameters = transformParams('blocks', this.params);
		topAccountsSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns list of addresses with the highest LSK balance on the chain',
				schema: {
					$ref: '#/definitions/topAccountsWithEnvelope',
				},
			},
		};
		Object.assign(topAccountsSchema[this.swaggerApiPath].get.responses, response);
		return topAccountsSchema;
	},
	source: topAccountsSource,
	envelope,
};
