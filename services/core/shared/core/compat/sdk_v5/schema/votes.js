/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
	primaryKey: 'tempId',
	schema: {
		// TODO: Remove 'tempId' after composite PK support is added
		tempId: { type: 'string', isDefaultColumn: true }, // ['id', 'receivedAddress']
		id: { type: 'string', isDefaultColumn: true },
		sentAddress: { type: 'string', isDefaultColumn: true },
		receivedAddress: { type: 'string', isDefaultColumn: true },
		amount: { type: 'bigInteger', isDefaultColumn: true },
		timestamp: { type: 'integer', isDefaultColumn: true },
		isAggregated: { type: 'boolean', null: false, defaultValue: false, isDefaultColumn: true },
	},
	indexes: {
		id: { type: 'key' },
		sentAddress: { type: 'key' },
		receivedAddress: { type: 'key' },
		amount: { type: 'range' },
		timestamp: { type: 'range' },
	},
	purge: {},
};
