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
const logger = require('lisk-service-framework').Logger();
const core = require('../shared/core');

module.exports = [
	{
		name: 'refresh.pendingTxs',
		description: 'Keep pending transactions list up-to-date',
		interval: 1, // seconds
		init: () => {
			logger.debug('Initializing pending transactions list...');
			core.getPendingTransactions();
		},
		controller: () => {
			logger.debug('Scheduling pending transactions list reload...');
			core.getPendingTransactions();
		},
	},
];
