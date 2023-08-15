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
	tableName: 'ccu',
	primaryKey: 'transactionID',
	schema: {
		transactionID: { type: 'string', null: false },
		height: { type: 'integer', null: false },
		sendingChainID: { type: 'string', null: true, defaultValue: null },
	},
	indexes: {
		height: { type: 'range' },
		sendingChainID: { type: 'key' },
	},
	purge: {},
};
