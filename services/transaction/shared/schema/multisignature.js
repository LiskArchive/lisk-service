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
	primaryKey: 'serviceId',
	charset: 'utf8mb4',
	schema: {
		serviceId: { type: 'string', null: false },
		nonce: { type: 'integer', null: false },
		senderPublicKey: { type: 'string', null: false },
		asset: { type: 'text', null: true, defaultValue: '' },
		moduleAssetId: { type: 'string' },
		fee: { type: 'string', null: true, defaultValue: '' },
		createdAt: { type: 'integer', null: false, defaultValue: Math.floor(Date.now() / 1000) },
		modifiedAt: { type: 'integer', null: false, defaultValue: Math.floor(Date.now() / 1000) },
		expiresAt: { type: 'integer', null: false, defaultValue: Math.floor(Date.now() / 1000) + 31556952 }, // +1 year
		rejected: { type: 'boolean', null: true },
	},
	indexes: {},
	purge: {},
};
