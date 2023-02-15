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
	getGenerators,
	getGeneratorStatus,
	updateGeneratorStatus,
} = require('../shared/sdk');

module.exports = [
	{
		name: 'getGenerators',
		controller: getGenerators,
		params: {},
	},
	{
		name: 'getGeneratorStatus',
		controller: getGeneratorStatus,
		params: {},
	},
	{
		name: 'updateGeneratorStatus',
		controller: async (params) => updateGeneratorStatus(params),
		params: {
			address: { optional: false, type: 'string' },
			password: { optional: false, type: 'string' },
			forging: { optional: false, type: 'boolean' },
			height: { optional: true, type: 'number' },
			maxHeightPrevoted: { optional: true, type: 'number' },
			maxHeightPreviouslyForged: { optional: true, type: 'number' },
			override: { optional: true, type: 'boolean' },
		},
	},
];
