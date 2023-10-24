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
const delay = require('lisk-service-framework/src/delay');

const { requestConnector } = require('./utils/request');

const logger = Logger();

const NODE_SYNC_CHECK_INTERVAL = 15 * 1000; // in ms

const waitForNodeToFinishSync = async () => {
	let isNodeSyncComplete = false;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		try {
			const networkConstants = await requestConnector('getNetworkStatus');
			const { syncing } = networkConstants;
			isNodeSyncComplete = !syncing;

			// eslint-disable-next-line no-unused-expressions
			syncing
				? logger.info(
						'Node synchronization in progress. Will wait for node to sync with the network before scheduling indexing.',
				  )
				: logger.info('Node is fully synchronized with the network.');
		} catch (err) {
			logger.warn(`Failed to check node synchronization status.\nError: ${err.message}`);
		}

		// Break loop when node is synchronized
		if (isNodeSyncComplete) break;

		await delay(NODE_SYNC_CHECK_INTERVAL);
	}
};

module.exports = {
	waitForNodeToFinishSync,
};
