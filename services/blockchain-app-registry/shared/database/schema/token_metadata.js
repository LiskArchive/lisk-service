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
	tableName: 'token_metadata',
	primaryKey: ['network', 'chainName', 'localID'],
	schema: {
		chainID: { type: 'string' },
		chainName: { type: 'string' },
		network: { type: 'string' },
		localID: { type: 'string' },
		tokenName: { type: 'string' },
		tokenID: { type: 'string' },
	},
	indexes: {
		chainID: { type: 'key' },
		chainName: { type: 'key' },
		localID: { type: 'key' },
		tokenName: { type: 'key' },
		network: { type: 'key' },
		tokenID: { type: 'key' },
	},
	purge: {},
};
