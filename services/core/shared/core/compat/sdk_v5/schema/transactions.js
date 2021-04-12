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
	primaryKey: 'id',
	charset: 'utf8mb4',
	schema: {
		id: { type: 'string' },
		height: { type: 'integer' },
		moduleAssetId: { type: 'string' },
		nonce: { type: 'integer' },
		blockId: { type: 'string' },
		timestamp: { type: 'integer' },
		senderPublicKey: { type: 'string' },
		recipientId: { type: 'string' },
		amount: { type: 'bigInteger' },
		data: { type: 'string' },
		size: { type: 'integer' },
		fee: { type: 'bigInteger' },
		minFee: { type: 'bigInteger' },
	},
	indexes: {
		height: { type: 'range' },
		moduleAssetId: { type: 'key' },
		nonce: { type: 'range' },
		blockId: { type: 'key' },
		timestamp: { type: 'range' },
		senderPublicKey: { type: 'key' },
		recipientId: { type: 'key' },
		amount: { type: 'range' },
		data: { type: 'key' },
	},
	purge: {},
};
