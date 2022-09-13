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

const dposConstantsSource = require('../../../sources/version3/dposConstants');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/dpos/constants',
	rpcMethod: 'get.dpos.constants',
	tags: ['DPoS'],
	envelope,
	params: {},
	paramsRequired: true,
	validParamPairings: [],
	get schema() {
		const unlocksSchema = {};
		unlocksSchema[this.swaggerApiPath] = { get: {} };
		unlocksSchema[this.swaggerApiPath].get.tags = this.tags;
		unlocksSchema[this.swaggerApiPath].get.summary = 'Requests DPoS Constants';
		unlocksSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns a set of constant values from DPoS Module',
		});
		unlocksSchema[this.swaggerApiPath].get.parameters = transformParams('DPoS', this.params);
		unlocksSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a set of constant values from DPoS Module',
				schema: {
					$ref: '#/definitions/dposConstants',
				},
			},
		};
		Object.assign(unlocksSchema[this.swaggerApiPath].get.responses, response);
		return unlocksSchema;
	},
	source: dposConstantsSource,
};
