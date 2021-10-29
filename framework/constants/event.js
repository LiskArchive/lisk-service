#!/usr/bin/env node
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
const cliEndpoint = 'blockchain';

const events = [
	'connect',
	'reconnect',
	'connect_error',
	'connect_timeout',
	'error',
	'disconnect',
	'reconnect_attempt',
	'reconnecting',
	'reconnect_error',
	'reconnect_failed',
];

const webSocket = {
	// endpoint: `wss://testnet-service-staging.lisk.com/${cliEndpoint}`,
	// endpoint: `ws://testnet-service-dev.liskdev.net/${cliEndpoint}`,
	endpoint: `ws://localhost:9901/${cliEndpoint}`,
};

module.exports = {
	webSocket,
	events,
};
