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
const votersSource = require('../../../sources/version2/voters');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');
const { transformParams, response } = require('../../swagger/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/votes_received',
	rpcMethod: 'get.votes_received',
	tags: ['Accounts'],
	envelope,
	params: {
		address: { optional: true, type: 'string', min: 3, max: 41 },
		username: { optional: true, type: 'string', min: 3, max: 20 },
		publickey: { optional: true, type: 'string', min: 64, max: 64 },
		limit: { optional: true, min: 1, max: 100, type: 'number', default: 10 },
		offset: { optional: true, min: 0, type: 'number', default: 0 },
	},
	paramsRequired: true,
	validParamPairings: [
		['address'],
		['username'],
		['publickey'],
	],
	get schema() {
		const votersSchema = {};
		votersSchema[this.swaggerApiPath] = { get: {} };
		votersSchema[this.swaggerApiPath].get.tags = this.tags;
		votersSchema[this.swaggerApiPath].get.summary = 'Requests votes received data';
		votersSchema[this.swaggerApiPath].get.description = `Returns votes received data\n RPC=> ${this.rpcMethod}`;
		votersSchema[this.swaggerApiPath].get.parameters = transformParams('voters', this.params);
		votersSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'array of votes received',
				schema: {
					$ref: '#/definitions/VotesReceivedWithEnvelope',
				},
			},
		};
		Object.assign(votersSchema[this.swaggerApiPath].get.responses, response);
		return votersSchema;
	},
	source: votersSource,
};
