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
const logger = require('./logger')();

const registerSocketRpcApi = (server, apiConfig, apiInternalConfig) => new Promise((resolve) => {
// const socketClient = new SocketClient(`${apiInternalConfig.endpoint}${apiInternalConfig.path}`);
// const socketEndpoint = io.of(apiConfig.apiPath);
// const eventsKeys = Object.keys(apiInternalConfig.events);

	// eslint-disable-next-line import/no-dynamic-require
	const registerCustomSocketApi = require(`../apis/${apiConfig.name}/routing`);

	registerCustomSocketApi(server.socketio.of(apiConfig.apiPath), apiInternalConfig).then(() => {
		logger.info(`${apiConfig.name || apiConfig.description} registered as ${apiConfig.apiPath}`);
		resolve();
	});
});

module.exports = registerSocketRpcApi;
