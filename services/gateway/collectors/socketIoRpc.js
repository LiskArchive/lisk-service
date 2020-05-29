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
const config = require('../config');
const socketPool = require('../services/socketPool');
const logger = require('../services/logger')();

/* eslint-disable-next-line consistent-return */
const socketRpcRequest = (method, source, params) => new Promise(async (resolve, reject) => {
	const endpointUrl = config.endpoints[source.endpoint].url;
	try {
		logger.trace(`Requesting ${endpointUrl}, method ${source.method}`);
		const response = await socketPool(endpointUrl, { method: source.method, params });
		if (typeof response === 'object' && response.jsonrpc === '2.0') return resolve(response.result);
		throw new Error({ error: true, message: `Response from ${endpointUrl}, method ${source.method} is not in JSON-RPC 2.0 format.` });
	} catch (err) {
		logger.warn(`Error while retrieveing data from ${endpointUrl}, method ${source.method}`);
		reject({ error: true, message: err.message });
	}
});

module.exports = socketRpcRequest;
