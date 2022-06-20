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
	primaryKey: 'id',
	charset: 'utf8mb4',
	schema: {
		id: { type: 'string' },
		height: { type: 'integer' },
		moduleCommandID: { type: 'string' },
		nonce: { type: 'integer' },
		blockID: { type: 'string' },
		timestamp: { type: 'integer' },
		senderAddress: { type: 'string' },
		recipientAddress: { type: 'string' },
		amount: { type: 'bigInteger' },
		data: { type: 'string' },
		size: { type: 'integer' },
		fee: { type: 'bigInteger' },
		minFee: { type: 'bigInteger' },
	},
	indexes: {
		height: { type: 'range' },
		moduleCommandID: { type: 'key' },
		nonce: { type: 'range' },
		blockID: { type: 'key' },
		timestamp: { type: 'range' },
		senderAddress: { type: 'key' },
		recipientAddress: { type: 'key' },
		amount: { type: 'range' },
		data: { type: 'key' },
	},
	purge: {},
};
