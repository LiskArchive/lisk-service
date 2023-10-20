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
import io from 'socket.io-client';

const socketPool = {};

export const subscribeAndReturn = (endpoint, event) =>
	new Promise(resolve => {
		if (!socketPool[endpoint])
			socketPool[endpoint] = io(endpoint, { forceNew: true, transports: ['websocket'] });
		const socket = socketPool[endpoint];

		socket.on(event, answer => {
			socket.close();
			resolve(answer);
		});
	});

export const closeAllConnections = () => {
	Object.keys(socketPool).forEach(s => socketPool[s].close());
};

module.exports = {
	subscribeAndReturn,
	closeAllConnections,
};
