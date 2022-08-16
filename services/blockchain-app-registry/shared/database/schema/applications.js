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
	primaryKey: ['chainName', 'network'],
	schema: {
		chainName: { type: 'string' },
		chainID: { type: 'string' },
		genesisURL: { type: 'string' },
		network: { type: 'string' },
		projectPage: { type: 'string' },
		logo: { type: 'json' },
		backgroundColor: { type: 'string' },
		serviceURLs: { type: 'json' },
		explorers: { type: 'json' },
		isDefault: { type: 'boolean', null: false, defaultValue: false },
		title: { type: 'string', null: true },
		description: { type: 'string', null: true },
		appPage: { type: 'string', null: true },
		appNodes: { type: 'json', null: true },
	},
	indexes: {
		chainID: { type: 'key' },
		chainName: { type: 'key' },
		network: { type: 'key' },
		isDefault: { type: 'key' },
	},
	purge: {},
};
