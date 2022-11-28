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
const dposVotesReceivedSource = require('../../../sources/version3/posRewardsLocked');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/pos/rewards/locked',
	rpcMethod: 'get.pos.rewards.locked',
	tags: ['PoS'],
	params: {
		address: { optional: true, type: 'string', pattern: regex.ADDRESS_LISK32 },
		publicKey: { optional: true, type: 'string', pattern: regex.PUBLIC_KEY },
		name: { optional: true, type: 'string', pattern: regex.NAME },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	get schema() {
		const votersSchema = {};
		votersSchema[this.swaggerApiPath] = { get: {} };
		votersSchema[this.swaggerApiPath].get.tags = this.tags;
		votersSchema[this.swaggerApiPath].get.summary = 'Requests locked rewards data';
		votersSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns locked rewards data',
		});
		votersSchema[this.swaggerApiPath].get.parameters = transformParams('PoS', this.params);
		votersSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of votes received for a specified delegate address or name',
				schema: {
					$ref: '#/definitions/PoSRewardsLockedWithEnvelope',
				},
			},
		};
		Object.assign(votersSchema[this.swaggerApiPath].get.responses, response);
		return votersSchema;
	},
	source: dposVotesReceivedSource,
	envelope,
};
