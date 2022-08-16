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
module.exports = {
	tableName: 'tokens',
	primaryKey: ['chainName', 'name'],
	schema: {
		chainID: { type: 'string' },
		chainName: { type: 'string' },
		network: { type: 'string' },
		tokenID: { type: 'string' },
		tokenName: { type: 'string' },
		description: { type: 'string', null: true },
		symbol: { type: 'string' },
		displayDenom: { type: 'string' },
		baseDenom: { type: 'string' },
		denomUnits: { type: 'json' },
		logo: { type: 'json' },
	},
	indexes: {
		chainID: { type: 'key' },
		chainName: { type: 'key' },
		tokenID: { type: 'key' },
		tokenName: { type: 'key' },
		network: { type: 'key' },
	},
	purge: {},
};
