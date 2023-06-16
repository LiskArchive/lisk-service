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
const tokenTopBalancesSource = require('../../../../../sources/version3/tokenTopBalances');
const envelope = require('../../../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../../../shared/regex');
const { transformParams, getSwaggerDescription } = require('../../../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/token/balances/top',
	rpcMethod: 'get.token.balances.top',
	tags: ['Token'],
	params: {
		tokenID: { optional: false, type: 'string', pattern: regex.TOKEN_ID },
		search: { optional: true, type: 'string', min: 1, pattern: regex.PARTIAL_SEARCH, altSwaggerKey: 'searchByNameAddressPubKey' },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: ['balance:desc', 'balance:asc'],
			default: 'balance:desc',
		},
	},
	get schema() {
		const tokenTopBalancesSchema = {};
		tokenTopBalancesSchema[this.swaggerApiPath] = { get: {} };
		tokenTopBalancesSchema[this.swaggerApiPath].get.tags = this.tags;
		tokenTopBalancesSchema[this.swaggerApiPath].get.summary = 'Requests the list of top accounts for the specified tokenID.';
		tokenTopBalancesSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns the list of top accounts for the specified tokenID.',
		});
		tokenTopBalancesSchema[this.swaggerApiPath].get.parameters = transformParams('tokens', this.params);
		tokenTopBalancesSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns the list of top accounts for the specified tokenID.',
				schema: {
					$ref: '#/definitions/tokenTopBalancesWithEnvelope',
				},
			},
		};
		return tokenTopBalancesSchema;
	},
	source: tokenTopBalancesSource,
	envelope,
};
