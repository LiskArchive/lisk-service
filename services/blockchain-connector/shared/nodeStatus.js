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
const {
	Logger,
	Signals,
	Utils: { waitForIt },
} = require('lisk-service-framework');

const { getNodeInfo } = require('./sdk/endpoints');

const config = require('../config');

const logger = Logger();

const liskAppAddress = config.endpoints.liskWs;
const NODE_DISCOVERY_INTERVAL = 1 * 1000; // ms
const NODE_SYNC_CHECK_INTERVAL = 15 * 1000; // in ms

let intervalID;

const checkStatus = () =>
	new Promise((resolve, reject) =>
		getNodeInfo()
			.then(nodeInfo => {
				resolve(nodeInfo);
			})
			.catch(() => {
				logger.debug(`The node ${liskAppAddress} not available at the moment.`);
				reject();
			}),
	);

const waitForNode = () => waitForIt(checkStatus, NODE_DISCOVERY_INTERVAL);

const waitForNodeToFinishSync = resolve =>
	new Promise(res => {
		if (!resolve) resolve = res;
		if (intervalID) {
			clearInterval(intervalID);
			intervalID = null;
		}

		return getNodeInfo(true).then(nodeInfo => {
			const { syncing } = nodeInfo;
			const isNodeSyncComplete = !syncing;

			return isNodeSyncComplete
				? (() => {
						logger.info('Node is fully synchronized with the network.');
						Signals.get('nodeIsSynced').dispatch();
						return resolve(isNodeSyncComplete);
				  })()
				: (() => {
						logger.info(
							'Node synchronization in progress. Will wait for node to sync with the network before scheduling indexing.',
						);
						intervalID = setInterval(
							waitForNodeToFinishSync.bind(null, resolve),
							NODE_SYNC_CHECK_INTERVAL,
						);
				  })();
		});
	});

module.exports = {
	waitForNode,
	waitForNodeToFinishSync,
};
