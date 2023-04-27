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
const rewardConstantsSource = require('../../../../../sources/version3/rewardConstants');
const envelope = require('../../../../../sources/version3/mappings/stdEnvelope');
const { getSwaggerDescription } = require('../../../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/reward/constants',
	rpcMethod: 'get.reward.constants',
	tags: ['(Dynamic) Reward'],
	params: {},
	get schema() {
		const rewardConstantsSchema = {};
		rewardConstantsSchema[this.swaggerApiPath] = { get: {} };
		rewardConstantsSchema[this.swaggerApiPath].get.tags = this.tags;
		rewardConstantsSchema[this.swaggerApiPath].get.summary = 'Requests reward constants.';
		rewardConstantsSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns reward constants.',
		});
		rewardConstantsSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns reward constants.',
				schema: {
					$ref: '#/definitions/rewardConstantsWithEnvelope',
				},
			},
		};
		return rewardConstantsSchema;
	},
	source: rewardConstantsSource,
	envelope,
};
