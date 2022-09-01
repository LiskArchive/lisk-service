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
	tableName: 'transactions',
	primaryKey: 'id',
	charset: 'utf8mb4',
	schema: {
		id: { type: 'string', null: false },
		height: { type: 'integer', null: false },
		moduleCommand: { type: 'string', null: false },
		nonce: { type: 'integer', null: false },
		blockID: { type: 'string', null: false },
		timestamp: { type: 'integer', null: false },
		senderAddress: { type: 'string', null: false },
		recipientAddress: { type: 'string', null: true, default: null },
		size: { type: 'integer', null: false },
		fee: { type: 'bigInteger', null: false },
		minFee: { type: 'bigInteger', null: false },
		// TODO: Fix executionStatus after events are resolved
		// executionStatus: { type: 'string', null: false },
		executionStatus: { type: 'string', null: true, defaultValue: null },
		isCCU: { type: 'boolean', null: false, defaultValue: false },
	},
	indexes: {
		height: { type: 'range' },
		moduleCommand: { type: 'key' },
		nonce: { type: 'range' },
		blockID: { type: 'key' },
		timestamp: { type: 'range' },
		senderAddress: { type: 'key' },
		executionStatus: { type: 'key' },
	},
	purge: {},
};
