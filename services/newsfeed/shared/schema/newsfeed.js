/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
	primaryKey: 'source_id',
	charset: 'utf8mb4',
	schema: {
		hash: { type: 'string' },
		author: { type: 'string' },
		content_t: { type: 'text', null: false },
		content_orig: { type: 'text', null: false },
		image_url: { type: 'string' },
		source: { type: 'string', null: false },
		source_id: { type: 'string' },
		ctime: { type: 'integer', null: false },
		mtime: { type: 'integer' },
		title: { type: 'string' },
		url: { type: 'string', null: false },
	},
	indexes: {
		source: { type: 'key' },
	},
	purge: {},
};
