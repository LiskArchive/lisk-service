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
	primaryKey: 'height',
	schema: {
		id: { type: 'string' },
		height: { type: 'integer' },
		timestamp: { type: 'integer' },
		generatorPublicKey: { type: 'string' },
		size: { type: 'integer' },
		reward: { type: 'bigInteger' },
		isFinal: { type: 'boolean' },
	},
	indexes: {
		id: { type: 'key' },
		height: { type: 'range' },
		timestamp: { type: 'range' },
		generatorPublicKey: { type: 'key' },
		size: { type: 'range' },
		isFinal: { type: 'key' },
		reward: { type: 'range' },
	},
	purge: {},
};
