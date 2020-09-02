/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const votersSource = require('../../../sources/voters');
const envelope = require('../../../sources/mappings/stdEnvelope');
const { transformParams } = require('../swagger/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/voters',
	rpcMethod: 'get.voters',
	tags: ['Accounts'],
	envelope,
	params: {
		address: { optional: true, type: 'string', min: 1, max: 21 },
		username: { optional: true, type: 'string', min: 3, max: 20 },
		publickey: { optional: true, type: 'string', min: 64, max: 64 },
		secpubkey: { optional: true, type: 'string', min: 64, max: 64 },
		limit: { optional: true, min: 1, max: 100, type: 'number' },
		offset: { optional: true, min: 0, type: 'number' },
	},
	get schema() {
		const votersSchema = {};
		votersSchema[this.swaggerApiPath] = { get: {} };
		votersSchema[this.swaggerApiPath].get.tags = this.tags;
		votersSchema[this.swaggerApiPath].get.parameters = transformParams('voters', this.params);
		votersSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'array of votes',
				schema: {
					type: 'array',
					items: {
						$ref: '#/definitions/VotesWithEnvelope',
					},
				},
			},
			400: {
				description: 'bad input parameter',
			},
			404: {
				description: 'Not found',
			},
		};
		return votersSchema;
	},
	source: votersSource,
};
