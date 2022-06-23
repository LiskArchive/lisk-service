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
const dposVotesSentSource = require('../../../sources/version3/dposVotesSent');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/dpos/votes/sent',
	rpcMethod: 'get.dpos.votes.sent',
	tags: ['Accounts'],
	envelope,
	params: {
		address: { optional: false, type: 'string', min: 3, max: 41, pattern: regex.ADDRESS_BASE32 },
		name: { optional: true, type: 'string', min: 3, max: 20, pattern: regex.NAME },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10, pattern: regex.LIMIT },
		offset: { optional: true, type: 'number', min: 0, default: 0, pattern: regex.OFFSET },
	},
	source: dposVotesSentSource,
};
