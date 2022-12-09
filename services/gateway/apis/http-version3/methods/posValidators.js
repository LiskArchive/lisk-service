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
const validatorsSource = require('../../../sources/version3/posValidators');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/pos/validators',
	rpcMethod: 'get.pos.validators',
	tags: ['PoS'],
	params: {
		address: { optional: true, type: 'string', pattern: regex.ADDRESS_LISK32 },
		publicKey: { optional: true, type: 'string', pattern: regex.PUBLIC_KEY },
		name: { optional: true, type: 'string', pattern: regex.NAME },
		status: { optional: true, type: 'string', pattern: regex.POS_VALIDATOR_STATUS },
		search: { optional: true, type: 'string', min: 1 },
		limit: { optional: true, type: 'number', min: 1, max: 103, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: [
				'commission:asc', 'commission:desc',
				'validatorWeight:desc', 'validatorWeight:asc',
				'rank:asc', 'rank:desc',
				'name:asc', 'name:desc',
			],
			default: 'commission:asc',
		},
	},
	get schema() {
		const validatorsSchema = {};
		validatorsSchema[this.swaggerApiPath] = { get: {} };
		validatorsSchema[this.swaggerApiPath].get.tags = this.tags;
		validatorsSchema[this.swaggerApiPath].get.summary = 'Requests validators list.';
		validatorsSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns validators list.',
		});
		validatorsSchema[this.swaggerApiPath].get.parameters = transformParams('PoS', this.params);
		validatorsSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of validators.',
				schema: {
					$ref: '#/definitions/validatorsWithEnvelope',
				},
			},
		};
		Object.assign(validatorsSchema[this.swaggerApiPath].get.responses, response);
		return validatorsSchema;
	},
	source: validatorsSource,
	envelope,
};
