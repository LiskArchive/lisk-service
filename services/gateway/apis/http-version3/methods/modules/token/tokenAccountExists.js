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
const tokenAccountExistsSource = require('../../../../../sources/version3/tokenAccountExists');
const envelope = require('../../../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/token/account/exists',
	rpcMethod: 'get.token.account.exists',
	tags: ['Token'],
	params: {
		address: { optional: true, type: 'string', pattern: regex.ADDRESS_LISK32 },
		publicKey: { optional: true, type: 'string', pattern: regex.PUBLIC_KEY },
		name: { optional: true, type: 'string', pattern: regex.NAME, altSwaggerKey: 'accountName' },
		tokenID: { optional: false, type: 'string', pattern: regex.TOKEN_ID },
	},
	paramsRequired: true,
	validParamPairings: [
		['address', 'tokenID'],
		['publicKey', 'tokenID'],
		['name', 'tokenID'],
	],
	get schema() {
		const accountExistsSchema = {};
		accountExistsSchema[this.swaggerApiPath] = { get: {} };
		accountExistsSchema[this.swaggerApiPath].get.tags = this.tags;
		accountExistsSchema[this.swaggerApiPath].get.summary = 'Requests to check existence of an account for the specified token.';
		accountExistsSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns existence of an account for the specified token.',
		});
		accountExistsSchema[this.swaggerApiPath].get.parameters = transformParams('tokens', this.params);
		accountExistsSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns existence of an account for the specified token.',
				schema: {
					$ref: '#/definitions/tokenAccountExistsWithEnvelope',
				},
			},
		};
		Object.assign(accountExistsSchema[this.swaggerApiPath].get.responses, response);
		return accountExistsSchema;
	},
	source: tokenAccountExistsSource,
	envelope,
};
