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
const dposVotesReceivedSource = require('../../../sources/version3/dposVotesReceived');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/dpos/votes/received',
	rpcMethod: 'get.dpos.votes.received',
	tags: ['DPoS'],
	params: {
		address: { optional: false, type: 'string', min: 3, max: 41, pattern: regex.ADDRESS_BASE32 },
		name: { optional: true, type: 'string', min: 3, max: 20, pattern: regex.NAME },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	get schema() {
		const votersSchema = {};
		votersSchema[this.swaggerApiPath] = { get: {} };
		votersSchema[this.swaggerApiPath].get.tags = this.tags;
		votersSchema[this.swaggerApiPath].get.summary = 'Requests votes received data';
		votersSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns votes received data',
		});
		votersSchema[this.swaggerApiPath].get.parameters = transformParams('DPoS', this.params);
		votersSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of votes received for a specified delegate address or name',
				schema: {
					$ref: '#/definitions/VotesReceivedWithEnvelope',
				},
			},
		};
		Object.assign(votersSchema[this.swaggerApiPath].get.responses, response);
		return votersSchema;
	},
	source: dposVotesReceivedSource,
	envelope,
};
