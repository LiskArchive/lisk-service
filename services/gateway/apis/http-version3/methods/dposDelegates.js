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
const delegatesSource = require('../../../sources/version3/dposDelegates');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/dpos/delegates',
	rpcMethod: 'get.dpos.delegates',
	tags: ['DPoS'],
	params: {
		address: { optional: true, type: 'string', min: 3, max: 41, pattern: regex.ADDRESS_LISK32 },
		name: { optional: true, type: 'string', min: 1, max: 20, pattern: regex.NAME },
		status: { optional: true, type: 'string', pattern: regex.DPOS_DELEGATE_STATUS },
		search: { optional: true, type: 'string', min: 1 },
		limit: { optional: true, type: 'number', min: 1, max: 103, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	get schema() {
		const delegatesSchema = {};
		delegatesSchema[this.swaggerApiPath] = { get: {} };
		delegatesSchema[this.swaggerApiPath].get.tags = this.tags;
		delegatesSchema[this.swaggerApiPath].get.summary = 'Requests delegates list';
		delegatesSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns delegates list',
		});
		delegatesSchema[this.swaggerApiPath].get.parameters = transformParams('PoS', this.params);
		delegatesSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of delegates',
				schema: {
					$ref: '#/definitions/delegatesWithEnvelope',
				},
			},
		};
		Object.assign(delegatesSchema[this.swaggerApiPath].get.responses, response);
		return delegatesSchema;
	},
	source: delegatesSource,
	envelope,
};
