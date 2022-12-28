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
	getBlockchainAppsStatistics,
	getBlockchainApps,
} = require('./controllers/blockchainApps');

module.exports = [
	{
		name: 'blockchain.apps.statistics',
		controller: getBlockchainAppsStatistics,
		params: {},
	},
	{
		name: 'blockchain.apps',
		controller: getBlockchainApps,
		params: {
			chainID: { optional: true, type: 'string' },
			name: { optional: true, type: 'string' },
			state: { optional: true, type: 'string' },
			search: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
		},
	},
];
