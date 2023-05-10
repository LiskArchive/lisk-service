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
const generatorsSource = require('../../../sources/version3/generators');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/generators',
	rpcMethod: 'get.generators',
	params: {
		search: { optional: true, type: 'string', pattern: regex.PARTIAL_SEARCH, altSwaggerKey: 'searchByNameAddressPubkey' },
		limit: { optional: true, type: 'number', min: 1, max: 103, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	tags: ['Generators'],
	get schema() {
		const generatorSchema = {};
		generatorSchema[this.swaggerApiPath] = { get: {} };
		generatorSchema[this.swaggerApiPath].get.tags = this.tags;
		generatorSchema[this.swaggerApiPath].get.summary = 'Requests generators list';
		generatorSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns generators list',
		});
		generatorSchema[this.swaggerApiPath].get.parameters = transformParams('Generators', this.params);
		generatorSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of generators',
				schema: {
					$ref: '#/definitions/generatorsWithEnvelope',
				},
			},
		};
		Object.assign(generatorSchema[this.swaggerApiPath].get.responses, response);
		return generatorSchema;
	},
	source: generatorsSource,
	envelope,
};
