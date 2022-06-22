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
		crossChainCommandID: { type: 'string' },
		name: { type: 'string' },
		nonce: { type: 'integer' },
		blockID: { type: 'string' },
		timestamp: { type: 'integer' },
		sendingChainID: { type: 'string' },
		receivingChainID: { type: 'string' },
		fee: { type: 'bigInteger' },
		status: { type: 'string' },
	},
	indexes: {
		height: { type: 'range' },
		moduleCommandID: { type: 'key' },
		nonce: { type: 'range' },
		blockID: { type: 'key' },
		timestamp: { type: 'range' },
		sendingChainID: { type: 'key' },
		receivingChainID: { type: 'key' },
		status: { type: 'key' },
	},
	purge: {},
};
