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
const votesSource = require('../../../sources/version1/votes');
const envelope = require('../../../sources/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	method: 'get.votes',
	envelope,
	params: {
		address: { required: false, type: 'string', minLength: 1, maxLength: 21 },
		username: { required: false, type: 'string', minLength: 3, maxLength: 20 },
		publickey: { required: false, type: 'string', minLength: 64, maxLength: 64 },
		secpubkey: { required: false, type: 'string', minLength: 64, maxLength: 64 },
		limit: { required: false, min: 1, max: 100, type: 'number' },
		offset: { required: false, min: 0, type: 'number' },
	},
	source: votesSource,
};
