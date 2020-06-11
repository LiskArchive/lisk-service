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
/* eslint-disable no-console,no-multi-spaces,key-spacing,no-unused-vars */

const io = require('socket.io-client');
const prettyjson = require('prettyjson');
const jsome = require('jsome');

jsome.params.colored = true;

const cliEndpoint = 'blockchain';
const config = {
	// endpoint: `wss://testnet-service-staging.lisk.io/${cliEndpoint}`,
	// endpoint: `ws://testnet-service-dev.liskdev.net/${cliEndpoint}`,
	endpoint: `ws://localhost:9901/${cliEndpoint}`,
};

const socket = io(config.endpoint, { forceNew: true, transports: ['websocket'] });

[
	'connect', 'reconnect',
	'connect_error', 'connect_timeout', 'error', 'disconnect',
	'reconnect', 'reconnect_attempt',
	'reconnecting', 'reconnect_error', 'reconnect_failed',
	// 'ping', 'pong',
].forEach(item => {
	socket.on(item, res => {
		console.log(`Event: ${item}, res: ${res || '-'}`);
	});
});

['status'].forEach(eventName => {
	socket.on(eventName, newData => {
		console.log(`Received data from ${config.endpoint}/${eventName}: ${newData}`);
	});
});

const subscribe = event => {
	socket.on(event, answer => {
		console.log(`====== ${event} ======`);
		// console.log(prettyjson.render(answer));
		jsome(answer);
	});
};

subscribe('update.block');
subscribe('update.transactions.unconfirmed');
subscribe('update.transactions.confirmed');
subscribe('update.moleculer.test');
