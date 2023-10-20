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
const { getRewardTokenID, getAnnualInflation, getDefaultRewardAtHeight } = require('../shared/sdk');

module.exports = [
	{
		name: 'getRewardTokenID',
		controller: async () => getRewardTokenID(),
		params: {},
	},
	{
		name: 'getAnnualInflation',
		controller: async ({ height }) => getAnnualInflation(height),
		params: {},
	},
	{
		name: 'getDefaultRewardAtHeight',
		controller: async ({ height }) => getDefaultRewardAtHeight(height),
		params: {
			height: { optional: false, type: 'number', min: 0 },
		},
	},
];
