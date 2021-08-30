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
		hash: { type: 'string', isDefaultSelect: true },
		author: { type: 'string', isDefaultSelect: true },
		content_t: { type: 'text', null: false, isDefaultSelect: true },
		content_orig: { type: 'text', null: false, isDefaultSelect: true },
		image_url: { type: 'string', isDefaultSelect: true },
		source: { type: 'string', null: false, isDefaultSelect: true },
		source_id: { type: 'string', isDefaultSelect: true },
		created_at: { type: 'integer', null: false, isDefaultSelect: true },
		modified_at: { type: 'integer', null: false, isDefaultSelect: true },
		title: { type: 'string', isDefaultSelect: true },
		url: { type: 'string', null: false, isDefaultSelect: true },
	},
	indexes: {
		source: { type: 'key' },
	},
	purge: {},
};
