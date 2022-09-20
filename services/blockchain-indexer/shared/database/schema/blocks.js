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
	tableName: 'blocks',
	primaryKey: 'height',
	schema: {
		id: { type: 'string' },
		height: { type: 'integer' },
		timestamp: { type: 'integer' },
		generatorAddress: { type: 'string' },
		size: { type: 'integer' },
		isFinal: { type: 'boolean', defaultValue: false },
		assetsModules: { type: 'json' },
		numberOfEvents: { type: 'integer' },
		reward: { type: 'bigInteger' },
	},
	indexes: {
		id: { type: 'key' },
		height: { type: 'range' },
		timestamp: { type: 'range' },
		generatorAddress: { type: 'key' },
		size: { type: 'range' },
		isFinal: { type: 'key' },
	},
	purge: {},
};
