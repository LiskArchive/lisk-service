/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const logger = require('lisk-service-framework').Logger();
const { SocketClient } = require('lisk-service-framework');

const config = require('../../../../config');

const register = (events) => {
	const coreSocket = SocketClient(config.endpoints.liskWs);
	logger.info(`Registering ${config.endpoints.liskWs} for blockchain events`);

	coreSocket.socket.on('blocks/change', async data => events.newBlock(data));
	coreSocket.socket.on('blocks/change', async data => events.calculateFeeEstimate(data));
	coreSocket.socket.on('round/change', async data => events.newRound(data));
};

module.exports = { register };
