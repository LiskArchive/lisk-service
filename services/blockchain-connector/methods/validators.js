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
const { validateBLSKey } = require('../shared/sdk/endpoints');
const regex = require('../shared/utils/regex');

module.exports = [
	{
		name: 'validateBLSKey',
		controller: async ({ blsKey, proofOfPossession }) => validateBLSKey({ blsKey, proofOfPossession }),
		params: {
            blsKey: { optional: false, type: 'string', pattern: regex.BLS_KEY },
            proofOfPossession: { optional: false, type: 'string', pattern: regex.PROOF_OF_POSSESSION },
		},
	},
];
