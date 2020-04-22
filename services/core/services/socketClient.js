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
const io = require('socket.io-client');
const logger = require('./logger')();
const util = require('util');

class SocketClient {
	constructor(path) {
		this.socket = io.connect(path, {
			transports: ['websocket'],
		});

		this.socket.on('connect', () => {
			logger.info(`SocketClient is connected on ${path}`);
		});

		this.socket.on('connect_error', (error) => {
			logger.warn(`Connection error \n${util.inspect(error)}`);
		});

		this.socket.on('connect_timeout', (timeout) => {
			logger.warn(`Connection timeout: ${timeout}`);
		});

		this.socket.on('error', (error) => {
			logger.error(util.inspect(error));
		});

		this.socket.on('disconnect', (reason) => {
			logger.info(`Disconnected.\n${reason}`);
		});

		this.socket.on('reconnect', () => {
			logger.info('Reconnection');
		});

		this.socket.on('reconnecting', () => {
			logger.info('Reconnecting');
		});

		this.socket.on('reconnect_error', (error) => {
			logger.warn(`Reconnection error \n${util.inspect(error)}`);
		});

		this.socket.on('reconnect_failed', () => {
			logger.error('Reconnection failed');
		});

		this.socket.on('ping', () => {
			logger.trace('Ping');
		});

		this.socket.on('pong', () => {
			logger.trace('Pong');
		});
	}

	emit(event, data) {
		this.socket.emit(event, data);
	}
}

module.exports = SocketClient;
