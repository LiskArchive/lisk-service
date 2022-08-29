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
			ip: { optional: true, type: 'any' },
			networkVersion: { optional: true, type: 'any' },
			state: { optional: true, type: 'any' },
			height: { optional: true, type: 'any' },
			limit: { optional: true, type: 'any' },
			offset: { optional: true, type: 'any' },
			sort: { optional: true, type: 'any' },
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
