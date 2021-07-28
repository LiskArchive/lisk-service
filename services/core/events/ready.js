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

const { getCurrentStatus } = require('../ready');

const Signals = require('../shared/signals');

const logger = Logger();

module.exports = [
	{
		name: 'coreService.Ready',
		description: 'Returns current readiness status of Lisk Core service',
		controller: async callback => {
			const coreServiceReadyListener = async () => {
				logger.debug('Returns current readiness status of the Lisk Core service');
				const coreStatus = await getCurrentStatus();
				callback(coreStatus);
			};
			Signals.get('coreServiceReady').add(coreServiceReadyListener);
		},
	},
];
