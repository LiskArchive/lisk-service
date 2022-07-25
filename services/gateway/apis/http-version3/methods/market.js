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
const marketPricesSource = require('../../../sources/version3/marketPrices');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/market/prices',
	rpcMethod: 'get.market.prices',
	tags: ['Market'],
	params: {},
	get schema() {
		const marketPricesSchema = {};
		marketPricesSchema[this.swaggerApiPath] = { get: {} };
		marketPricesSchema[this.swaggerApiPath].get.tags = this.tags;
		marketPricesSchema[this.swaggerApiPath].get.parameters = transformParams(
			'marketPrices',
			this.params,
		);
		marketPricesSchema[this.swaggerApiPath].get.summary = 'Requests market prices';
		marketPricesSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns market prices',
		});
		marketPricesSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of market prices by currency pairs',
				schema: {
					$ref: '#/definitions/MarketPricesWithEnvelope',
				},
			},
		};
		Object.assign(marketPricesSchema[this.swaggerApiPath].get.responses, response);
		return marketPricesSchema;
	},
	source: marketPricesSource,
	envelope,
};
