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
		id: { type: 'string' }, // CCM ID
		transactionID: { type: 'string' }, // CCU ID - foreign key to transactions.id
		nonce: { type: 'bigInteger' },
		moduleCrossChainCommandID: { type: 'string' },
		sendingChainID: { type: 'string' },
		receivingChainID: { type: 'string' },
		fee: { type: 'bigInteger' },
		status: { type: 'string' },
		ccms: { type: 'json' },
	},
	indexes: {
		sendingChainID: { type: 'key' },
		receivingChainID: { type: 'key' },
		status: { type: 'key' },
	},
	purge: {},
};
