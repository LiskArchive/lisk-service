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
	tableName: 'commissions',
	primaryKey: ['address', 'height'],
	schema: {
		address: { type: 'string', null: false },
		commission: { type: 'string', null: false },
		height: { type: 'string', null: false },
	},
	indexes: {
		address: { type: 'key' },
		commission: { type: 'range' },
		height: { type: 'range' },
	},
	purge: {},
};
