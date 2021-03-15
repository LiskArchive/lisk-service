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
const { transformParams, response } = require('../swagger/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/delegates/latest_registrations',
	tags: ['Delegates'],
	params: {
		limit: { optional: true, min: 1, max: 101, type: 'number', default: 10 },
		offset: { optional: true, min: 0, type: 'number', default: 0 },
	},
	get schema() {
		const delegateSchema = {};
		delegateSchema[this.swaggerApiPath] = { get: {} };
		delegateSchema[this.swaggerApiPath].get.tags = this.tags;
		delegateSchema[this.swaggerApiPath].get.summary = 'Requests recently registered delegates data';
		delegateSchema[this.swaggerApiPath].get.parameters = transformParams('delegates', this.params);
		delegateSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'array of recently registered delegates',
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
	source: {
		...delegatesSource,
		method: 'core.delegates.latest_registrations',
		params: {
			offset: '=',
			limit: '=',
		},
	},
	envelope,
};
