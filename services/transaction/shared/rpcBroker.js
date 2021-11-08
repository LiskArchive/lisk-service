/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const { Logger } = require('lisk-service-framework');
const logger = Logger();

let ServiceBroker;

const setBrokerHandle = (h) => ServiceBroker = h;

const requestRpc = (method, params) => new Promise((resolve, reject) => {
	ServiceBroker.call(method, params).then(res => resolve(res))
		.catch(err => {
			logger.error(`Error occurred! ${err.message}`);
			reject(err);
		});
});

module.exports = {
	default: requestRpc,

	requestRpc,
	setBrokerHandle,
};
