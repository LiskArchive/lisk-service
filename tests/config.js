/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
module.exports = {
	// Functional test configs
	SERVICE_ENDPOINT_HTTP: process.env.SERVICE_ENDPOINT || 'http://127.0.0.1:9901',
	SERVICE_ENDPOINT_RPC: process.env.SERVICE_ENDPOINT || 'ws://127.0.0.1:9901',

	// Integration test configs
	SERVICE_ENDPOINT: process.env.SERVICE_ENDPOINT || 'http://127.0.0.1:9901',
	MOCK_ENDPOINT: process.env.MOCK_ENDPOINT || 'http://127.0.0.1:9006',
	SERVICE_STAGING: process.env.SERVICE_STAGING || 'https://mainnet-service-staging.lisk.com',
	SERVICE_PROD: process.env.SERVICE_PROD || 'https://service.lisk.com',
};
