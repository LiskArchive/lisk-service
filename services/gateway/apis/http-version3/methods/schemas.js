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
const SchemasSource = require('../../../sources/version3/schemas');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const { getSwaggerDescription, response } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/schemas',
	rpcMethod: 'get.schemas',
	tags: ['Schemas'],
	params: {},
	get schema() {
		const schemas = {};
		schemas[this.swaggerApiPath] = { get: {} };
		schemas[this.swaggerApiPath].get.tags = this.tags;
		schemas[this.swaggerApiPath].get.summary = 'Requests schemas.';
		schemas[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns schemas.',
		});
		schemas[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of schemas.',
				schema: {
					$ref: '#/definitions/SchemaWithEnvelope',
				},
			},
		};
		Object.assign(schemas[this.swaggerApiPath].get.responses, response);
		return schemas;
	},
	source: SchemasSource,
	envelope,
};
