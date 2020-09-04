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
const peer = require('../../../sources/mappings/peer');
const envelope = require('../../../sources/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/peers/connected',
	tags: ['Peers'],
	get schema() {
		const peerSchema = {};
		peerSchema[this.swaggerApiPath] = { get: {} };
		peerSchema[this.swaggerApiPath].get.tags = this.tags;
		peerSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'array of connected peers',
				schema: {
					type: 'array',
					items: {
						$ref: '#/definitions/PeersWithEnvelope',
					},
				},
			},
			404: {
				$ref: '#/responses/notFound',
			},
		};
		return peerSchema;
	},
	source: [{
		type: 'moleculer',
		method: 'core.peers.connected',
		params: {},
		definition: {
			data: ['data', peer],
			meta: {
				count: '=,number',
				offset: '=,number',
				total: '=,number',
			},
			links: {},
		},
	}],
	envelope,
};
