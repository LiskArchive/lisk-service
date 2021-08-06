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
const getTwitterConfig = () => ({
	name: 'twitter_lisk',
	table: 'newsfeed',
	type: 'twitter',
	interval: 5 * 60, // seconds
	expiryInDays: Number(process.env.NEWSFEED_DB_EXPIRY_DAYS || 30),
	url: 'statuses/user_timeline',
	requestOptions: {
		screen_name: 'liskHQ',
		count: 30,
		exclude_replies: true,
		include_rts: true,
	},
	newsfeed: {
		mapper: {
			hash: '=,string',
			author: '=,string',
			content_orig: 'text,string',
			content_t: 'text,string',
			image_url: '=,string',
			source: '=,string',
			source_id: 'id,string',
			created_at: '=,number',
			modified_at: '=,number',
			title: '=,string',
			url: '=,string',
		},
		customMapper: [
			['created_at', 'twitterUnixTimestamp', 'created_at'],
			['modified_at', 'twitterUnixTimestamp', 'created_at'],
		],
	},
});

module.exports = getTwitterConfig;
