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
const currentTimestamp = () => Math.floor(Date.now() / 1000);

module.exports = {
	tableName: 'blocks',
	primaryKey: 'id',
	schema: {
		id: { type: 'string', null: false },
		block: { type: 'json', null: false },
		timestamp: { type: 'integer', null: false, defaultValue: currentTimestamp() },
	},
	indexes: {
		id: { type: 'key' },
		timestamp: { type: 'range' },
	},
	purge: {},
};
