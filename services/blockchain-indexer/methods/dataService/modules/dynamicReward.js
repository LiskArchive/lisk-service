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
	getDefaultRewardAtHeight,
	getAnnualInflation,
	getRewardConstants,
} = require('../controllers/dynamicReward');

module.exports = [
	{
		name: 'reward.default',
		controller: getDefaultRewardAtHeight,
		params: {
			height: { optional: false, type: 'number', min: 0 },
		},
	},
	{
		name: 'reward.annualInflation',
		controller: getAnnualInflation,
		params: {
			height: { optional: false, type: 'number', min: 0 },
		},
	},
	{
		name: 'reward.constants',
		controller: getRewardConstants,
		params: {},
	},
];
