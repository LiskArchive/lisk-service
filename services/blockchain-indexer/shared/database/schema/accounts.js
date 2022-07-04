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
	primaryKey: 'address',
	schema: {
		address: { type: 'string' },
		balance: { type: 'bigInteger', null: false, defaultValue: 0 },
		isDelegate: { type: 'boolean', null: false, defaultValue: false },
		publicKey: { type: 'string', null: true },
		name: { type: 'string', null: true },
		generatorKey: { type: 'string', null: true },
		blsKey: { type: 'string', null: true },
		proofOfPosession: { type: 'string', null: true },
		rewards: { type: 'bigInteger', null: false, defaultValue: 0 },
		producedBlocks: { type: 'integer', null: false, defaultValue: 0 },
	},
	indexes: {
		balance: { type: 'range' },
		name: { type: 'key' },
	},
	purge: {},
};
