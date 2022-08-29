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
	tableName: 'applications',
	primaryKey: ['network', 'chainName'],
	schema: {
		chainName: { type: 'string' },
		chainID: { type: 'string' },
		network: { type: 'string' },
		isDefault: { type: 'boolean', null: false, defaultValue: false },
		appDirName: { type: 'string' },
	},
	indexes: {
		chainID: { type: 'key' },
		chainName: { type: 'key' },
		network: { type: 'key' },
		isDefault: { type: 'key' },
	},
	purge: {},
};
