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
const rewardAnnualInflationSource = require('../../../../../sources/version3/rewardAnnualInflation');
const envelope = require('../../../../../sources/version3/mappings/stdEnvelope');
const { response, getSwaggerDescription, transformParams } = require('../../../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/reward/annual-inflation',
	rpcMethod: 'get.reward.annual-inflation',
	tags: ['(Dynamic) Reward'],
	params: {
		height: { optional: false, type: 'number', min: 0, altSwaggerKey: 'blockHeight' },
	},
	get schema() {
		const rewardAnnualInflationSchema = {};
		rewardAnnualInflationSchema[this.swaggerApiPath] = { get: {} };
		rewardAnnualInflationSchema[this.swaggerApiPath].get.tags = this.tags;
		rewardAnnualInflationSchema[this.swaggerApiPath].get.summary = 'Requests inflation rate.';
		rewardAnnualInflationSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns inflation rate.',
		});
		rewardAnnualInflationSchema[this.swaggerApiPath].get.parameters = transformParams('reward', this.params);
		rewardAnnualInflationSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns current inflation rate.',
				schema: {
					$ref: '#/definitions/rewardInflationWithEnvelope',
				},
			},
		};
		Object.assign(rewardAnnualInflationSchema[this.swaggerApiPath].get.responses, response);
		return rewardAnnualInflationSchema;
	},
	source: rewardAnnualInflationSource,
	envelope,
};
