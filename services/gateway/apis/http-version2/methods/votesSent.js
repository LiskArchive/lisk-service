/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const votesSource = require('../../../sources/version2/votes');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/votes_sent',
	rpcMethod: 'get.votes_sent',
	tags: ['Accounts'],
	envelope,
	params: {
		address: { optional: true, type: 'string', min: 3, max: 41 },
		username: { optional: true, type: 'string', min: 3, max: 20 },
		publicKey: { optional: true, type: 'string', min: 64, max: 64 },
	},
	paramsRequired: true,
	validParamPairings: [
		['address'],
		['username'],
		['publicKey'],
	],
	get schema() {
		const votesSchema = {};
		votesSchema[this.swaggerApiPath] = { get: {} };
		votesSchema[this.swaggerApiPath].get.tags = this.tags;
		votesSchema[this.swaggerApiPath].get.summary = 'Requests votes sent data';
		votesSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns votes sent data',
		});
		votesSchema[this.swaggerApiPath].get.parameters = transformParams('votes', this.params);
		votesSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'array of votes sent',
				schema: {
					$ref: '#/definitions/VotesSentWithEnvelope',
				},
			},
		};
		Object.assign(votesSchema[this.swaggerApiPath].get.responses, response);
		return votesSchema;
	},
	source: votesSource,
};
