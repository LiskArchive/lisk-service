/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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

const { requestIndexer } = require('./utils/request');

const logger = Logger();

const NODE_SYNC_CHECK_INTERVAL = 15 * 1000; // in ms

let intervalID;

const waitForNodeToFinishSync = (resolve) => new Promise((res) => {
	if (!resolve) resolve = res;
	if (intervalID) {
		clearInterval(intervalID);
		intervalID = null;
	}

	return requestIndexer('network.status').then(({ data: networkConstants }) => {
		const { syncing } = networkConstants;
		const isNodeSyncComplete = !syncing;
		return syncing
			? (() => {
				logger.info('Node synchronization in progress. Will wait for node to sync with the network before scheduling indexing.');
				intervalID = setInterval(
					waitForNodeToFinishSync.bind(null, resolve),
					NODE_SYNC_CHECK_INTERVAL,
				);
			})()
			: (() => {
				logger.info('Node is fully synchronized with the network.');
				return resolve(isNodeSyncComplete);
			})();
	});
});

module.exports = {
	waitForNodeToFinishSync,
};
