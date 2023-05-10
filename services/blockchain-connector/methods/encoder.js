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
const { encodeCCM } = require('../shared/sdk');
const regex = require('../shared/utils/regex');

module.exports = [
	{
		name: 'encodeCCM',
		controller: async ({ ccm }) => encodeCCM(ccm),
		params: {
			ccm: {
				optional: false,
				type: 'object',
				props: {
					module: { optional: false, type: 'string', pattern: regex.MODULE },
					crossChainCommand: { optional: false, type: 'string', pattern: regex.COMMAND },
					nonce: { optional: false, type: 'string', pattern: regex.NONCE },
					fee: { optional: false, type: 'string' },
					sendingChainID: { optional: false, type: 'string', pattern: regex.CHAIN_ID },
					receivingChainID: { optional: false, type: 'string', pattern: regex.CHAIN_ID },
					params: { optional: false, type: 'string', pattern: regex.HEX_STRING },
					status: { optional: false, type: 'number' },
				},
			},
		},
	},
];
