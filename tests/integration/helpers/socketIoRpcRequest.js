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

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlRpcV1 = `${baseUrl}/rpc`;

const request = (endpoint, method, params) => new Promise((resolve, reject) => {
	const socket = io(endpoint, { forceNew: true, transports: ['websocket'] });

	socket.emit('request', { method, params }, (answer) => {
		socket.close();
		if (answer.error) {
			reject(answer);
		} else {
			resolve(answer);
		}
	});
});

export const api = {
	get: async (...args) => {
		const [error, response] = await to(request(...args));
		if (error) {
			throw error.error;
		}
		return response.result;
	},
	getJsonRpcV1: (...args) => api.get(baseUrlRpcV1, ...args),
};

export default request;
