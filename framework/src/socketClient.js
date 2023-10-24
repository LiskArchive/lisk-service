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
const util = require('util');
const io = require('socket.io-client');
const debug = require('debug')('framework:socket');

const connectionPool = {};

const SocketClient = endpoint => {
	if (!connectionPool[endpoint]) {
		connectionPool[endpoint] = io.connect(endpoint, {
			transports: ['websocket'],
		});
	}

	const socket = connectionPool[endpoint];

	socket.on('connect', () => {
		debug(`SocketClient is connected on ${endpoint}`);
	});

	socket.on('connect_error', error => {
		debug(`Connection error \n${util.inspect(error)}`);
	});

	socket.on('connect_timeout', timeout => {
		debug(`Connection timeout: ${timeout}`);
	});

	socket.on('error', error => {
		debug(util.inspect(error));
	});

	socket.on('disconnect', reason => {
		debug(`Disconnected.\n${reason}`);
	});

	socket.on('reconnect', () => {
		debug('Reconnection');
	});

	socket.on('reconnecting', () => {
		debug('Reconnecting');
	});

	socket.on('reconnect_error', error => {
		debug(`Reconnection error \n${util.inspect(error)}`);
	});

	socket.on('reconnect_failed', () => {
		debug('Reconnection failed');
	});

	const emit = (event, data) =>
		// eslint-disable-next-line implicit-arrow-linebreak
		new Promise(resolve => {
			socket.emit(event, data, answer => {
				debug(
					`Emitting socket event ${event} with data ${util.inspect(data)}: ${util.inspect(answer)}`,
				);
				resolve(answer);
			});
		});

	const requestRpc = params =>
		// eslint-disable-next-line implicit-arrow-linebreak
		new Promise(resolve => {
			debug(`Emitting RPC request ${params}`);
			socket.emit('request', params, answer => {
				debug(
					`Received RPC answer for method ${params.method} with params ${params}: ${util.inspect(
						answer,
					)}`,
				);
				answer(resolve);
			});
		});

	return {
		emit,
		requestRpc,
		socket,
	};
};

module.exports = SocketClient;
