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
	getNetworkStatus,
	getNetworkStatistics,
	getNetworkPeers,
	getNetworkConnectedPeers,
	getNetworkDisconnectedPeers,
} = require('./controllers/network');

module.exports = [
	{
		name: 'network.status',
		controller: getNetworkStatus,
		params: {},
	},
	{
		name: 'network.statistics',
		controller: getNetworkStatistics,
		params: {},
	},
	{
		name: 'network.peers',
		controller: getNetworkPeers,
		params: {
			ip: { optional: true, type: 'string' },
			networkVersion: { optional: true, type: 'string' },
			state: { optional: true, type: 'string' },
			height: { optional: true, type: 'number' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
			sort: { optional: true, type: 'string' },
		},
	},
	{
		name: 'network.peers.connected',
		controller: getNetworkConnectedPeers,
		params: {},
	},
	{
		name: 'network.peers.disconnected',
		controller: getNetworkDisconnectedPeers,
		params: {},
	},
];
