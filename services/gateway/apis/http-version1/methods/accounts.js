/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const accountsSource = require('../../../sources/version1/accounts');
const envelope = require('../../../sources/version1/mappings/stdEnvelope');
const { transformParams, response } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/accounts',
	rpcMethod: 'get.accounts',
	tags: ['Accounts'],
	params: {
		address: { optional: true, type: 'string', min: 2 },
		publickey: { optional: true, type: 'string', min: 1 },
		secpubkey: { optional: true, type: 'string', min: 1 },
		username: { optional: true, type: 'string', min: 1 },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: { optional: true, type: 'string', enum: ['balance:asc', 'balance:desc'], default: 'balance:asc' },
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
		accountSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'array of accounts with details',
				schema: {
					type: 'array',
					items: {
						$ref: '#/definitions/AccountsWithEnvelope',
					},
				},
			},
		};
		Object.assign(accountSchema[this.swaggerApiPath].get.responses, response);
		return accountSchema;
	},
	source: accountsSource,
	envelope,
};
