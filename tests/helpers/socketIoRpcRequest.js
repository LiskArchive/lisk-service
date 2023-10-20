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
import to from 'await-to-js';
import io from 'socket.io-client';
import config from '../config';

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;

const socketPool = {};

const request = (endpoint, method, params) =>
	new Promise(resolve => {
		if (!socketPool[endpoint]) {
			socketPool[endpoint] = io(endpoint, { forceNew: true, transports: ['websocket'] });
		}
		const socket = socketPool[endpoint];

		socket.emit('request', { jsonrpc: '2.0', method, params }, answer => {
			resolve(answer);
		});
	});

const api = {
	get: async (...args) => {
		const [error, response] = await to(request(...args));
		if (error) {
			throw error.error;
		}
		return response.result;
	},
	getJsonRpcV1: (...args) => api.get(wsRpcUrl, ...args),
};

const close = socketName => {
	if (socketPool[socketName]) {
		socketPool[socketName].close();
		delete socketPool[socketName];
	}
};

const closeAll = () => {
	Object.keys(socketPool).forEach(n => close(n));
};

module.exports = {
	api,
	request,
	close,
	closeAll,
};
