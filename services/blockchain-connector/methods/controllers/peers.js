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
const peerInfo = require('../../src/sdk_v5/peers');

const getPeers = async params => peerInfo.getPeers(params);

const getConnectedPeers = async params => peerInfo.getConnectedPeers(params);

const getDisconnectedPeers = async params => peerInfo.getDisconnectedPeers(params);

const getPeersStatistics = async () => peerInfo.getPeersStatistics();

module.exports = {
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
};
