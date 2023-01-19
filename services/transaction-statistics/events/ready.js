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
const { Signals } = require('lisk-service-framework');

module.exports = [
	{
		name: 'statistics.Ready',
		description: 'Returns current readiness status of transaction statistics microservice',
		controller: async callback => {
			const statisticsServiceReadyListener = async () => callback(true);
			Signals.get('transactionStatsReady').add(statisticsServiceReadyListener);
		},
	},
];
