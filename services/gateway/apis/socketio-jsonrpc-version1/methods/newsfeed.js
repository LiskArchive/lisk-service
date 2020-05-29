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
const newsfeedSource = require('../../../sources/newsfeed');
const envelope = require('../../../sources/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	method: 'get.newsfeed',
	params: {
		limit: { required: false, default: 10, min: 1, max: 100 },
		offset: { required: false, default: 0, min: 0 },
		source: {
			required: false,
			enum: [
				'twitter_lisk',
				'drupal_lisk_general',
				'drupal_lisk_announcements',
			],
			allowMultiple: true,
		},
	},
	source: newsfeedSource,
	envelope,
	ttl: 1000 * 30,
};
