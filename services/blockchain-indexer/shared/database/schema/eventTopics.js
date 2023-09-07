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
	tableName: 'event_topics',
	primaryKey: ['eventID', 'topic'],
	schema: {
		eventID: { type: 'string' },
		topic: { type: 'string' },
		height: { type: 'integer' },
		name: { type: 'string' },
		module: { type: 'string' },
		index: { type: 'integer' },
		timestamp: { type: 'integer' },
	},
	indexes: {
		topic: { type: 'key' },
		height: { type: 'range' },
		name: { type: 'key' },
		module: { type: 'key' },
	},
	compositeIndexes: {
		timestamp_desc_index_asc: [{ key: 'timestamp', direction: 'DESC' }, { key: 'index', direction: 'ASC' }],
		timestamp_asc_index_asc: [{ key: 'timestamp', direction: 'ASC' }, { key: 'index', direction: 'ASC' }],
		timestamp_desc_index_desc: [{ key: 'timestamp', direction: 'DESC' }, { key: 'index', direction: 'DESC' }],
		timestamp_asc_index_desc: [{ key: 'timestamp', direction: 'ASC' }, { key: 'index', direction: 'DESC' }],
		height_desc_index_asc: [{ key: 'height', direction: 'DESC' }, { key: 'index', direction: 'ASC' }],
		height_asc_index_asc: [{ key: 'height', direction: 'ASC' }, { key: 'index', direction: 'ASC' }],
		height_desc_index_desc: [{ key: 'height', direction: 'DESC' }, { key: 'index', direction: 'DESC' }],
		height_asc_index_desc: [{ key: 'height', direction: 'ASC' }, { key: 'index', direction: 'DESC' }],
	},
	purge: {},
};
