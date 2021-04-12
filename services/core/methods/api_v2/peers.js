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
const {
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
} = require('./controllers/peers');

module.exports = [
	{
		name: 'peers',
		controller: getPeers,
		params: {
			ip: { optional: true, type: 'string', pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/ },
			networkVersion: { optional: true, type: 'string', pattern: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/ },
			state: { optional: true, type: 'string', enum: ['connected', 'disconnected', 'any'], default: 'connected', lowercase: true },
			height: { optional: true, min: 0, type: 'number', integer: true },
			limit: { optional: true, min: 1, max: 100, type: 'number', integer: true, default: 10 },
			offset: { optional: true, min: 0, type: 'number', integer: true, default: 0 },
			sort: { optional: true, type: 'string', enum: ['height:asc', 'height:desc', 'networkVersion:asc', 'networkVersion:desc'], default: 'height:desc' },
		},
	},
	{
		name: 'peers.connected',
		controller: getConnectedPeers,
		params: {},
	},
	{
		name: 'peers.disconnected',
		controller: getDisconnectedPeers,
		params: {},
	},
	{
		name: 'peers.statistics',
		controller: getPeersStatistics,
		params: {},
	},
];
