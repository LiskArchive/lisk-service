/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const accountsSource = require('../../../sources/version2/accounts');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/accounts',
	rpcMethod: 'get.accounts',
	tags: ['Accounts'],
	params: {
		address: { optional: true, type: 'string', min: 3, max: 41, pattern: /^lsk[a-hjkm-z2-9]{38}$/ },
		publicKey: { optional: true, type: 'string', min: 64, max: 64, pattern: /^([A-Fa-f0-9]{2}){32}$/ },
		username: { optional: true, type: 'string', min: 1, max: 20, pattern: /^[a-z0-9!@$&_.]{1,20}$/ },
		isDelegate: { optional: true, type: 'boolean', min: 1, pattern: /^(true|false)$/ },
		status: {
			optional: true,
			type: 'string',
			pattern: /^(?:\b(?:active|standby|banned|punished|ineligible)\b|\b(?:active|standby|banned|punished|ineligible|,){3,}\b){1}$/,
		},
		search: { optional: true, type: 'string', min: 1 },
		limit: { optional: true, type: 'number', min: 1, max: 103, default: 10, pattern: /^\b((?:[1-9][0-9]?)|(?:10[0-3]))\b$/ },
		offset: { optional: true, type: 'number', min: 0, default: 0, pattern: /^\b([0-9][0-9]*)\b$/ },
		sort: {
			optional: true,
			type: 'string',
			enum: ['balance:asc', 'balance:desc', 'rank:asc', 'rank:desc'],
		},
	},
	get schema() {
		const accountSchema = {};
		accountSchema[this.swaggerApiPath] = { get: {} };
		accountSchema[this.swaggerApiPath].get.tags = this.tags;
		accountSchema[this.swaggerApiPath].get.parameters = transformParams(
			'accounts',
			this.params,
		);
		accountSchema[this.swaggerApiPath].get.summary = 'Requests account data';
		accountSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns account data',
		});
		accountSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'array of accounts with details',
				schema: {
					$ref: '#/definitions/AccountsWithEnvelope',
				},
			},
		};
		Object.assign(accountSchema[this.swaggerApiPath].get.responses, response);
		return accountSchema;
	},
	source: accountsSource,
	envelope,
};
