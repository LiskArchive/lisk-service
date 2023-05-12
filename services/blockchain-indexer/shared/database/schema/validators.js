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
	tableName: 'validators',
	primaryKey: 'address',
	schema: {
		address: { type: 'string' },
		name: { type: 'string', null: true },
		blsKey: { type: 'string', null: true },
		proofOfPossession: { type: 'string', null: true },
		generatorKey: { type: 'string', null: true },
		generatedBlocks: { type: 'integer', null: false, defaultValue: 0 },
		totalCommission: { type: 'bigInteger', null: false, defaultValue: 0 },
		totalSelfStakeRewards: { type: 'bigInteger', null: false, defaultValue: 0 },
	},
	indexes: {
		name: { type: 'key' },
		generatorKey: { type: 'key' },
		blsKey: { type: 'key' },
	},
	purge: {},
};
