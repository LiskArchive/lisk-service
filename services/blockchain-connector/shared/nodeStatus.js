/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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

const { getNodeInfo } = require('./sdk/endpoints');

const config = require('../config');
const waitForIt = require('./utils/waitForIt');

const logger = Logger();

const liskAppAddress = config.endpoints.liskWs;
const NODE_DISCOVERY_INTERVAL = 1 * 1000; // ms

const checkStatus = () => new Promise((resolve, reject) => {
	getNodeInfo()
		.then(nodeInfo => { resolve(nodeInfo); })
		.catch(() => {
			logger.debug(`The node ${liskAppAddress} not available at the moment.`);
			reject();
		});
});

const waitForNode = () => waitForIt(checkStatus, NODE_DISCOVERY_INTERVAL);

module.exports = {
	waitForNode,
};
