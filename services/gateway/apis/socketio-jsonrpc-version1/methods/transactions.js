/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const transactionsSource = require('../../../sources/transactions');
const envelope = require('../../../sources/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	method: 'get.transactions',
	envelope,
	params: {
		id: { required: false, minLength: 1 },
		type: { required: false, minLength: 1, min: 0, max: 12 },
		address: { required: false, minLength: 1 },
		sender: { required: false, minLength: 1 },
		recipient: { required: false, minLength: 1 },
		min: { required: false },
		max: { required: false },
		from: { required: false },
		to: { required: false },
		block: { required: false, minLength: 1 },
		height: { required: false, minLength: 1 },
		limit: { required: false },
		offset: { required: false },
		sort: { required: false },
	},
	source: transactionsSource,
};
