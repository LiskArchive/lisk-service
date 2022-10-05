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
const dposUnlocksSource = require('../../../sources/version3/dposUnlocks');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/dpos/unlocks',
	rpcMethod: 'get.dpos.unlocks',
	tags: ['DPoS'],
	params: {
		address: { optional: true, type: 'string', min: 3, max: 41, pattern: regex.ADDRESS_LISK32 },
		name: { optional: true, type: 'string', min: 3, max: 20, pattern: regex.NAME },
		publicKey: { optional: true, type: 'string', min: 64, max: 64, pattern: regex.PUBLIC_KEY },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	paramsRequired: true,
	validParamPairings: [
		['address'],
		['name'],
		['publicKey'],
	],
	get schema() {
		const unlocksSchema = {};
		unlocksSchema[this.swaggerApiPath] = { get: {} };
		unlocksSchema[this.swaggerApiPath].get.tags = this.tags;
		unlocksSchema[this.swaggerApiPath].get.summary = 'Requests unlocks data';
		unlocksSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns unlocks information for the specified address, name or publicKey',
		});
		unlocksSchema[this.swaggerApiPath].get.parameters = transformParams('DPoS', this.params);
		unlocksSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns unlocks information for the specified address, name or publicKey',
				schema: {
					$ref: '#/definitions/unlocksWithEnvelope',
				},
			},
		};
		Object.assign(unlocksSchema[this.swaggerApiPath].get.responses, response);
		return unlocksSchema;
	},
	source: dposUnlocksSource,
	envelope,
};
