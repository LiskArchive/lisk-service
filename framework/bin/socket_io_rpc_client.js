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
/* eslint-disable no-console */

const io = require('socket.io-client');
const colorize = require('json-colorizer');
const { events } = require('../constants/event');

/* Usage:
 * node socket_io_rpc_client.js http://127.0.0.1:9901/rpc-test get.hello.param '{"path_name1": "user1"}'
 */

if (process.argv.length < 4) {
	console.log('Usage: client.js <endpoint> <call> [json]');
	process.exit(1);
}

const cliEndpoint = process.argv[2];
const cliProcedureName = process.argv[3];
const cliParams = process.argv[4] ? JSON.parse(process.argv[4]) : undefined;
const TIMEOUT = 15 * 1000;

const socket = io(cliEndpoint, { forceNew: true, transports: ['websocket'] });

events.forEach(item => {
	socket.on(item, res => {
		console.log(`Event: ${item}, res: ${res || '-'}`);
	});
});

['status'].forEach(eventName => {
	socket.on(eventName, newData => {
		console.log(`Received data from ${cliEndpoint}/${eventName}: ${newData}`);
	});
});

const request = (path, params) => {
	socket.emit(path, params, answer => {
		// console.log(prettyjson.render(answer));
		console.log(colorize(JSON.stringify(answer, null, 2)));
		process.exit(0);
	});
};

setTimeout(() => {
	console.log('Timeout exceeded - could not get a response');
	process.exit(1);
}, TIMEOUT);

// request('request', { method: 'get.hello', params: { name: 'michal' } });
// request('request', { jsonrpc: '2.0', params: cliParams });
// request('request', { jsonrpc: '2.0', method: cliProcedureName, params: cliParams });
request('request', { method: cliProcedureName, params: cliParams });
