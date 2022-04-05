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
	getForgers,
	getForgingStatus,
	updateForgingStatus,
} = require('../shared/sdk/actions');

module.exports = [
	{
		name: 'getForgers',
		controller: getForgers,
		params: {},
	},
	{
		name: 'getForgingStatus',
		controller: getForgingStatus,
		params: {},
	},
	{
		name: 'updateForgingStatus',
		controller: async (params) => updateForgingStatus(params),
		params: {
			address: { optional: false, type: 'any' },
			password: { optional: false, type: 'any' },
			forging: { optional: false, type: 'any' },
			height: { optional: true, type: 'any' },
			maxHeightPrevoted: { optional: true, type: 'any' },
			maxHeightPreviouslyForged: { optional: true, type: 'any' },
			override: { optional: true, type: 'any' },
		},
	},
];
