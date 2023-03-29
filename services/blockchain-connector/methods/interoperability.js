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
const {
	getChainAccount,
	getMainchainID,
} = require('../shared/sdk');

const regex = require('../shared/utils/regex');

module.exports = [
	{
		name: 'getChainAccount',
		controller: async ({ chainID }) => getChainAccount(chainID),
		params: {
			chainID: { optional: false, type: 'string', pattern: regex.CHAIN_ID },
		},
	},
	{
		name: 'getMainchainID',
		controller: async () => getMainchainID(),
		params: {
			chainID: { optional: false, type: 'string', pattern: regex.CHAIN_ID },
		},
	},
];
