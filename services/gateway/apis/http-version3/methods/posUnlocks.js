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
const posUnlocksSource = require('../../../sources/version3/posUnlocks');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/pos/unlocks',
	rpcMethod: 'get.pos.unlocks',
	tags: ['PoS'],
	params: {
		address: { optional: true, type: 'string', pattern: regex.ADDRESS_LISK32 },
		name: { optional: true, type: 'string', pattern: regex.NAME },
		publicKey: { optional: true, type: 'string', pattern: regex.PUBLIC_KEY },
		isUnlockable: { optional: true, type: 'boolean' },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	paramsRequired: true,
	validParamPairings: [
		['address'],
		['name'],
		['publicKey'],
		['address', 'isUnlockable'],
		['name', 'isUnlockable'],
		['publicKey', 'isUnlockable'],
	],
	get schema() {
		const unlocksSchema = {};
		unlocksSchema[this.swaggerApiPath] = { get: {} };
		unlocksSchema[this.swaggerApiPath].get.tags = this.tags;
		unlocksSchema[this.swaggerApiPath].get.summary = 'Requests PoS unlocks data.';
		unlocksSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns unlocks information for the specified address, name or publicKey.',
		});
		unlocksSchema[this.swaggerApiPath].get.parameters = transformParams('PoS', this.params);
		unlocksSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns unlocks information for the specified address, name or publicKey.',
				schema: {
					$ref: '#/definitions/PoSUnlocksWithEnvelope',
				},
			},
		};
		Object.assign(unlocksSchema[this.swaggerApiPath].get.responses, response);
		return unlocksSchema;
	},
	source: posUnlocksSource,
	envelope,
};
