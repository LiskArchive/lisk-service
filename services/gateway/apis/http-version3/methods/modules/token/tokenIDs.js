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
const tokenIDsSource = require('../../../../../sources/version3/tokenIDs');
const envelope = require('../../../../../sources/version3/mappings/stdEnvelope');
const { transformParams, getSwaggerDescription } = require('../../../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/token/ids',
	rpcMethod: 'get.token.ids',
	tags: ['Token'],
	params: {
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	get schema() {
		const tokenIDsSchema = {};
		tokenIDsSchema[this.swaggerApiPath] = { get: {} };
		tokenIDsSchema[this.swaggerApiPath].get.tags = this.tags;
		tokenIDsSchema[this.swaggerApiPath].get.summary = 'Requests the list of available tokens identifiers.';
		tokenIDsSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns all the available token identifiers.',
		});
		tokenIDsSchema[this.swaggerApiPath].get.parameters = transformParams('tokens', this.params);
		tokenIDsSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns all the available token identifiers.',
				schema: {
					$ref: '#/definitions/tokenIDsWithEnvelope',
				},
			},
		};
		return tokenIDsSchema;
	},
	source: tokenIDsSource,
	envelope,
};
