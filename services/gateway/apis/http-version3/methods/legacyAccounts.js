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
const legacyAccountsSource = require('../../../sources/version3/legacyAccountsSchema');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/legacy',
	rpcMethod: 'get.legacy',
	tags: ['Accounts'],
	params: {
		publicKey: { optional: false, type: 'string', min: 64, max: 64, pattern: regex.PUBLIC_KEY },
	},
	get schema() {
		const legacyAccountSchema = {};
		legacyAccountSchema[this.swaggerApiPath] = { get: {} };
		legacyAccountSchema[this.swaggerApiPath].get.tags = this.tags;
		legacyAccountSchema[this.swaggerApiPath].get.summary = 'Requests legacy account details';
		legacyAccountSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns legacy account details',
		});
		legacyAccountSchema[this.swaggerApiPath].get.parameters = transformParams('legacyAccount', this.params);
		legacyAccountSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Legacy account details',
				schema: {
					$ref: '#/definitions/legacyAccountWithEnvelope',
				},
			},
		};
		Object.assign(legacyAccountSchema[this.swaggerApiPath].get.responses, response);
		return legacyAccountSchema;
	},
	source: legacyAccountsSource,
};
