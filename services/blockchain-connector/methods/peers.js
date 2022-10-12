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
} = require('../shared/sdk');

module.exports = [
	{
		name: 'getPeers',
		controller: getPeers,
		params: {},
	},
	{
		name: 'getConnectedPeers',
		controller: getConnectedPeers,
		params: {},
	},
	{
		name: 'getDisconnectedPeers',
		controller: getDisconnectedPeers,
		params: {},
	},
	{
		name: 'getPeersStatistics',
		controller: getPeersStatistics,
		params: {},
	},
];
