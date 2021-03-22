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
const peersSource = require('../../../sources/version2/peers');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');
const { transformParams, response } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/peers',
	rpcMethod: 'get.peers',
	tags: ['Peers'],
	params: {
		ip: { optional: true, type: 'string' },
		networkVersion: { optional: true, type: 'string' },
		state: { optional: true, type: 'string', enum: ['0', '1', '2', 'connected', 'disconnected', 'unknown'], lowercase: true },
		height: { optional: true, type: 'number', integer: true },
		limit: { optional: true, min: 1, type: 'number', integer: true, default: 10 },
		offset: { optional: true, min: 0, type: 'number', integer: true, default: 0 },
		sort: { optional: true, type: 'string', enum: ['height:asc', 'height:desc', 'networkVersion:asc', 'networkVersion:desc'], default: 'height:desc' },
	},
	get schema() {
		const peerSchema = {};
		peerSchema[this.swaggerApiPath] = { get: {} };
		peerSchema[this.swaggerApiPath].get.tags = this.tags;
		peerSchema[this.swaggerApiPath].get.summary = 'Requests peers data';
		peerSchema[this.swaggerApiPath].get.description = `Returns peers data\n RPC=> ${this.rpcMethod}`;
		peerSchema[this.swaggerApiPath].get.parameters = transformParams('peers', this.params);
		peerSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'array of peers with details',
				schema: {
					$ref: '#/definitions/PeersWithEnvelope',
				},
			},
		};
		Object.assign(peerSchema[this.swaggerApiPath].get.responses, response);
		return peerSchema;
	},
	source: peersSource,
	envelope,
};
