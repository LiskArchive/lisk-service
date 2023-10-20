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
const networkPeersSource = require('../../../sources/version3/networkPeers');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');
const regex = require('../../../shared/regex');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/network/peers',
	rpcMethod: 'get.network.peers',
	tags: ['Network'],
	params: {
		ip: { optional: true, type: 'string', pattern: regex.IP },
		networkVersion: { optional: true, type: 'string', pattern: regex.NETWORK_VERSION },
		state: {
			optional: true,
			type: 'string',
			enum: ['connected', 'disconnected', 'any'],
			default: 'any',
			lowercase: true,
		},
		height: { optional: true, min: 0, type: 'number', integer: true },
		limit: { optional: true, min: 1, max: 100, type: 'number', integer: true, default: 10 },
		offset: { optional: true, min: 0, type: 'number', integer: true, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: ['height:asc', 'height:desc', 'networkVersion:asc', 'networkVersion:desc'],
			default: 'height:desc',
		},
	},
	get schema() {
		const networkPeerSchema = {};
		networkPeerSchema[this.swaggerApiPath] = { get: {} };
		networkPeerSchema[this.swaggerApiPath].get.tags = this.tags;
		networkPeerSchema[this.swaggerApiPath].get.summary = 'Requests peers data';
		networkPeerSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns peers data',
		});
		networkPeerSchema[this.swaggerApiPath].get.parameters = transformParams('peers', this.params);
		networkPeerSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of peer nodes in the network',
				schema: {
					$ref: '#/definitions/PeersWithEnvelope',
				},
			},
		};
		Object.assign(networkPeerSchema[this.swaggerApiPath].get.responses, response);
		return networkPeerSchema;
	},
	source: networkPeersSource,
	envelope,
};
