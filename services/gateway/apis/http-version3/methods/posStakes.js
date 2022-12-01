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
const posStakesSource = require('../../../sources/version3/posStakes');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/pos/stakes',
	rpcMethod: 'get.pos.stakes',
	tags: ['PoS'],
	params: {
		address: { optional: false, type: 'string', pattern: regex.ADDRESS_LISK32 },
		name: { optional: true, type: 'string', pattern: regex.NAME },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	get schema() {
		const stakesSchema = {};
		stakesSchema[this.swaggerApiPath] = { get: {} };
		stakesSchema[this.swaggerApiPath].get.tags = this.tags;
		stakesSchema[this.swaggerApiPath].get.summary = 'Requests stakes data';
		stakesSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns stakes data',
		});
		stakesSchema[this.swaggerApiPath].get.parameters = transformParams('PoS', this.params);
		stakesSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of stakes for the specified address or name',
				schema: {
					$ref: '#/definitions/StakesWithEnvelope',
				},
			},
		};
		Object.assign(stakesSchema[this.swaggerApiPath].get.responses, response);
		return stakesSchema;
	},
	source: posStakesSource,
	envelope,
};
