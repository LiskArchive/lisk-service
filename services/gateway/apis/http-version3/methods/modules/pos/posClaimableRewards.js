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
const posClaimableRewardsSource = require('../../../../../sources/version3/posClaimableRewards');
const envelope = require('../../../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/pos/rewards/claimable',
	rpcMethod: 'get.pos.rewards.claimable',
	tags: ['PoS'],
	params: {
		address: { optional: true, type: 'string', pattern: regex.ADDRESS_LISK32 },
		publicKey: { optional: true, type: 'string', pattern: regex.PUBLIC_KEY },
		name: { optional: true, type: 'string', pattern: regex.NAME, altSwaggerKey: 'validatorName' },
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
		const claimableRewardsSchema = {};
		claimableRewardsSchema[this.swaggerApiPath] = { get: {} };
		claimableRewardsSchema[this.swaggerApiPath].get.tags = this.tags;
		claimableRewardsSchema[this.swaggerApiPath].get.summary = 'Requests claimable rewards data from the PoS module.';
		claimableRewardsSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns claimable rewards data from the PoS module.',
		});
		claimableRewardsSchema[this.swaggerApiPath].get.parameters = transformParams('PoS', this.params);
		claimableRewardsSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of claimable rewards from the PoS module for the specified address, publicKey or validator name.',
				schema: {
					$ref: '#/definitions/posClaimableRewardsWithEnvelope',
				},
			},
		};
		Object.assign(claimableRewardsSchema[this.swaggerApiPath].get.responses, response);
		return claimableRewardsSchema;
	},
	source: posClaimableRewardsSource,
	envelope,
};
