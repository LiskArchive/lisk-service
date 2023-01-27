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
const posStakersSource = require('../../../../../sources/version3/posStakers');
const envelope = require('../../../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/pos/stakers',
	rpcMethod: 'get.pos.stakers',
	tags: ['PoS'],
	params: {
		address: { optional: true, type: 'string', pattern: regex.ADDRESS_LISK32 },
		publicKey: { optional: true, type: 'string', pattern: regex.PUBLIC_KEY },
		name: { optional: true, type: 'string', pattern: regex.NAME, altSwaggerKey: 'accountName' },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	paramsRequired: true,
	validParamPairings: [
		['address'],
		['publicKey'],
		['name'],
	],
	get schema() {
		const stakersSchema = {};
		stakersSchema[this.swaggerApiPath] = { get: {} };
		stakersSchema[this.swaggerApiPath].get.tags = this.tags;
		stakersSchema[this.swaggerApiPath].get.summary = 'Requests the list of stakers for the specified validator.';
		stakersSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns a list of stakers for the specified validator.',
		});
		stakersSchema[this.swaggerApiPath].get.parameters = transformParams('PoS', this.params);
		stakersSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of stakers for the specified validator address, publicKey or name.',
				schema: {
					$ref: '#/definitions/posStakersWithEnvelope',
				},
			},
		};
		Object.assign(stakersSchema[this.swaggerApiPath].get.responses, response);
		return stakersSchema;
	},
	source: posStakersSource,
	envelope,
};
