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
const {
	getConnectedPeers,
	getDisconnectedPeers,
	getPeers,
	getPeersStatistics,
} = require('./controllers/peers');

module.exports = [
	{
		name: 'peers',
		controller: getPeers,
		params: {
			ip: { type: 'any', optional: true },
			httpPort: { type: 'any', optional: true },
			wsPort: { type: 'any', optional: true },
			os: { type: 'any', optional: true },
			version: { type: 'any', optional: true },
			state: { type: 'any', optional: true },
			height: { type: 'any', optional: true },
			broadhash: { type: 'any', optional: true },
			limit: { type: 'any', optional: true },
			offset: { type: 'any', optional: true },
			sort: { type: 'any', optional: true },
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
