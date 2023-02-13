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
const rewardInflationSource = require('../../../../../sources/version3/rewardInflation');
const envelope = require('../../../../../sources/version3/mappings/stdEnvelope');
const { response, getSwaggerDescription } = require('../../../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/reward/inflation',
	rpcMethod: 'get.reward.inflation',
	tags: ['Reward'],
	params: {
		height: { optional: false, type: 'number', min: 0, altSwaggerKey: 'blockHeight' },
	},
	get schema() {
		const rewardInflationSchema = {};
		rewardInflationSchema[this.swaggerApiPath] = { get: {} };
		rewardInflationSchema[this.swaggerApiPath].get.tags = this.tags;
		rewardInflationSchema[this.swaggerApiPath].get.summary = 'Requests inflation rate.';
		rewardInflationSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns inflation rate.',
		});
		rewardInflationSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns current inflation rate.',
				schema: {
					$ref: '#/definitions/rewardInflationWithEnvelope',
				},
			},
		};
		Object.assign(rewardInflationSchema[this.swaggerApiPath].get.responses, response);
		return rewardInflationSchema;
	},
	source: rewardInflationSource,
	envelope,
};
