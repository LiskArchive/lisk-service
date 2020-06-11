/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const config = require('../config');
const core = require('../shared/core');

const liskCoreAddress = config.endpoints.liskHttp;
const logger = Logger();

// Report the Lisk Core status
let logConnectStatus = true;

const checkStatus = () => new Promise((resolve, reject) => {
	core.getNetworkConstants().then(result => {
		if (typeof result.data === 'object' && result.data.version) {
			core.setProtocolVersion(result.data.protocolVersion);
			core.setReadyStatus(true);
			if (logConnectStatus) {
				logger.info(`Connected to the node ${liskCoreAddress}, Lisk Core version ${result.data.version}`);
				logConnectStatus = false;
			}
			resolve(result.data);
		} else {
			core.setReadyStatus(false);
			logger.warn(`The node ${liskCoreAddress} has an incompatible API or is not available at the moment.`);
			logConnectStatus = true;
			reject();
		}
	}).catch(() => {
		core.setReadyStatus(false);
		logger.warn(`The node ${liskCoreAddress} not available at the moment.`);
		logConnectStatus = true;
		reject();
	});
});

module.exports = checkStatus;
