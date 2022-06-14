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
const legacyAccountsSource = require('../../../sources/version3/legacyAccountsSchema');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/legacy',
	rpcMethod: 'get.legacy',
	tags: ['Accounts'],
	params: {
		publicKey: { optional: false, type: 'string', min: 64, max: 64, pattern: /^([A-Fa-f0-9]{2}){32}$/ },
	},
	source: legacyAccountsSource,
};
