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
const {
	setCoreVersion,
	getEpochUnixTime,
	getNetworkConstants,
	setReadyStatus,
	setRegisteredmoduleAssets,
} = require('./core/compat/common');

const waitForIt = require('./waitForIt');

const liskCoreAddress = config.endpoints.liskHttp;
const logger = Logger();

const CORE_DISCOVERY_INTERVAL = 1 * 1000; // ms
const CORE_SYNC_CHECK_INTERVAL = 30 * 1000; // ms

let intervalID;

// Report the Lisk Core status
let logConnectStatus = true;

const checkStatus = () => new Promise((resolve, reject) => {
	getNetworkConstants().then(networkConstants => {
		if (typeof networkConstants.data === 'object' && networkConstants.data.version) {
			setCoreVersion(networkConstants.data.version);
			getEpochUnixTime();
			setReadyStatus(true);
			if (logConnectStatus) {
				logger.debug(`Connected to the node ${liskCoreAddress}, Lisk Core version ${networkConstants.data.version}`);
				logConnectStatus = false;
			}
			if (networkConstants.data.moduleAssets) {
				setRegisteredmoduleAssets(networkConstants.data.moduleAssets);
			}
			resolve(networkConstants.data);
		} else {
			setReadyStatus(false);
			logger.debug(`The node ${liskCoreAddress} has an incompatible API or is not available at the moment.`);
			logConnectStatus = true;
			reject();
		}
	}).catch(() => {
		setReadyStatus(false);
		logger.debug(`The node ${liskCoreAddress} not available at the moment.`);
		logConnectStatus = true;
		reject();
	});
});

const waitForNode = () => waitForIt(checkStatus, CORE_DISCOVERY_INTERVAL);

const waitForNodeToFinishSync = (resolve) => new Promise((res) => {
	if (!resolve) resolve = res;
	if (intervalID) {
		clearInterval(intervalID);
		intervalID = null;
	}

	return getNetworkConstants(true).then(({ data: networkConstants }) => {
		const { syncing } = networkConstants;
		const isNodeSyncComplete = !syncing;
		return syncing
			? (() => {
				logger.info('Node synchronization still in progress...');
				intervalID = setInterval(
					waitForNodeToFinishSync.bind(null, resolve),
					CORE_SYNC_CHECK_INTERVAL,
				);
			})()
			: resolve(isNodeSyncComplete);
	});
});

const getStatus = () => logConnectStatus;

module.exports = {
	CORE_SYNC_CHECK_INTERVAL,

	checkStatus,
	getStatus,
	waitForNode,
	waitForNodeToFinishSync,
};
