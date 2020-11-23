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
// const delegateCache = require('../shared/core/delegateCache');

module.exports = [
	{
		name: 'refresh.delegates',
		description: 'Keep the delegate list up-to-date',
		schedule: '*/5 * * * *', // Every 5 min
		updateOnInit: true,
		init: async () => {
			logger.debug('Scheduling initial list update...');
			await core.reloadDelegateCache();
			await core.reloadNextForgersCache();
		},
		controller: () => {
			logger.debug('Scheduling delegate list reload...');
			core.reloadDelegateCache();
		},
	},
];
