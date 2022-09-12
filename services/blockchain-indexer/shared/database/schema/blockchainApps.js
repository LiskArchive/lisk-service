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
	tableName: 'blockchain_apps',
	primaryKey: 'chainID',
	schema: {
		chainID: { type: 'string' },
		chainName: { type: 'string' },
		state: { type: 'string' },
		address: { type: 'string' },
		isDefault: { type: 'boolean', null: false, defaultValue: false },
		lastUpdated: { type: 'string' },
		lastCertificateHeight: { type: 'string' },
	},
	indexes: {
		chainID: { type: 'key' },
		state: { type: 'key' },
		chainName: { type: 'key' },
		isDefault: { type: 'key' },
	},
	purge: {},
};
