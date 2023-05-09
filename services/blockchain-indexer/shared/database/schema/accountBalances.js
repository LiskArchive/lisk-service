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
module.exports = {
	tableName: 'account_balances',
	primaryKey: ['address', 'tokenID'],
	schema: {
		address: { type: 'string', null: false },
		tokenID: { type: 'string', null: false },
		balance: { type: 'bigInteger', null: false, default: BigInt('0') },
	},
	indexes: {
		address: { type: 'key' },
		tokenID: { type: 'key' },
	},
	purge: {},
};
