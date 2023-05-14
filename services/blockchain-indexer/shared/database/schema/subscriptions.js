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
	tableName: 'subscriptions',
	primaryKey: 'address',
	schema: {
		address: { type: 'string' },
		publicKey: { type: 'string', null: true, defaultValue: null },
		price: { type: 'bigInteger', null: true, defaultValue: null },
		consumable: { type: 'bigInteger', null: true, defaultValue: null },
		streams: { type: 'bigInteger', null: true, defaultValue: null },
		// members: @todo enable this as an empty array
		maxMembers: { type: 'integer', null: true, defaultValue: null },
	},
	indexes: {},
	purge: {},
};
