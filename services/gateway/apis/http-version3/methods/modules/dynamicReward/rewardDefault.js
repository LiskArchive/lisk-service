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
const rewardDefaultSource = require('../../../../../sources/version3/rewardDefault');
const envelope = require('../../../../../sources/version3/mappings/stdEnvelope');
const { getSwaggerDescription, transformParams } = require('../../../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/reward/default',
	rpcMethod: 'get.reward.default',
	tags: ['(Dynamic) Reward'],
	params: {
		height: {
			optional: false,
			type: 'number',
			min: 0,
			integer: true,
			altSwaggerKey: 'blockHeightRequired',
		},
	},
	get schema() {
		const rewardDefaultSchema = {};
		rewardDefaultSchema[this.swaggerApiPath] = { get: {} };
		rewardDefaultSchema[this.swaggerApiPath].get.tags = this.tags;
		rewardDefaultSchema[this.swaggerApiPath].get.summary =
			'Requests default block generation reward at a specified height.';
		rewardDefaultSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns default block generation reward at the specified height.',
		});
		rewardDefaultSchema[this.swaggerApiPath].get.parameters = transformParams(
			'reward',
			this.params,
		);
		rewardDefaultSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns the default block generation reward at the specified height.',
				schema: {
					$ref: '#/definitions/rewardDefaultWithEnvelope',
				},
			},
		};
		return rewardDefaultSchema;
	},
	source: rewardDefaultSource,
	envelope,
};
