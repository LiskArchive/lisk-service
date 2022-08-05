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
	primaryKey: ['name', 'network'],
	schema: {
		name: { type: 'string' },
		chainID: { type: 'string', null: true },
		isDefault: { type: 'boolean', null: false, defaultValue: false },
		title: { type: 'string', null: true },
		description: { type: 'string', null: true },
		network: { type: 'string' },
		genesisBlock: { type: 'string', null: true },
		homepage: { type: 'string' },
		apis: { type: 'json' },
		explorers: { type: 'json' },
		images: { type: 'json' },
	},
	indexes: {
		chainID: { type: 'key' },
		name: { type: 'key' },
		network: { type: 'key' },
		isDefault: { type: 'key' },
	},
	purge: {},
};
