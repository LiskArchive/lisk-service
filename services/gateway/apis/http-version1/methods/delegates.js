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
const delegatesSource = require('../../../sources/version1/delegates');
const envelope = require('../../../sources/version1/mappings/stdEnvelope');
const { transformParams, response } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/delegates',
	rpcMethod: 'get.delegates',
	tags: ['Delegates'],
	params: {
		address: { optional: true, type: 'string', min: 2 },
		publickey: { optional: true, type: 'string', min: 1 },
		secpubkey: { optional: true, type: 'string', min: 1 },
		username: { optional: true, type: 'string', min: 1 },
		status: {
			optional: true,
			type: 'string',
			pattern: /^(?:\b(?:active|standby|banned|punished|ineligible)\b|\b(?:active|standby|banned|punished|ineligible|,){3,}\b){1}$/,
		},
		search: { optional: true, type: 'string', min: 1 },
		limit: { optional: true, type: 'number', min: 1, max: 103, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: [
				'username:asc', 'username:desc',
				'rank:asc', 'rank:desc',
				'productivity:asc', 'productivity:desc',
				'missedBlocks:asc', 'missedBlocks:desc',
			],
			default: 'rank:asc',
		},
	},
	get schema() {
		const delegateSchema = {};
		delegateSchema[this.swaggerApiPath] = { get: {} };
		delegateSchema[this.swaggerApiPath].get.tags = this.tags;
		delegateSchema[this.swaggerApiPath].get.summary = 'Requests delegates data';
		delegateSchema[this.swaggerApiPath].get.parameters = transformParams('delegates', this.params);
		delegateSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'array of delegates with details',
				schema: {
					type: 'array',
					items: {
						$ref: '#/definitions/DelegatesWithEnvelope',
					},
				},
			},
		};
		Object.assign(delegateSchema[this.swaggerApiPath].get.responses, response);
		return delegateSchema;
	},
	source: delegatesSource,
	envelope,
};
