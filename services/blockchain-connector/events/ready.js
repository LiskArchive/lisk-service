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
const { getNetworkStatus } = require('../shared/sdk');

module.exports = [
	{
		name: 'connector.Ready',
		description: 'Returns current readiness status of blockchain connector',
		controller: async callback => {
			const connectorServiceReadyListener = async () => {
				const networkStatus = await getNetworkStatus();
				const status = networkStatus ? !!Object.getOwnPropertyNames(networkStatus).length : false;
				callback(status);
			};
			Signals.get('chainNewBlock').add(connectorServiceReadyListener);
		},
	},
];
