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
const getTwitterConfig = ({ enabled, name }) => ({
	name,
	type: 'twitter',
	enabled,
	interval: 5 * 60, // seconds
	url: 'statuses/user_timeline',
	requestOptions: {
		screen_name: 'liskHQ',
		count: 20,
	},
	newsfeed: {
		mapper: {
			source: '=,string',
			source_id: 'id,string',
			hash: '=,string',
			content: 'text,string',
			url: '=,string',
			timestamp: '=',
			author: '=,string',
			image_url: '=,string',
		},
		customMapper: [['timestamp', 'convertTime', 'created_at']],
		query: {
			insert: 'INSERT INTO newsfeed(source, source_id, hash, title, content, url, timestamp, author, image_url) VALUES($1, $2, $3, \'\', $4, $5, $6, $7, $8) RETURNING id',
			select: `SELECT hash FROM newsfeed WHERE source='${name}' LIMIT 200`,
			delete: 'DELETE FROM newsfeed WHERE hash=$1',
		},
	},
	news_content: {
		mapper: {
			hash: '=,string',
			content: '=,string',
			source: '=,string', // to calculate hash
			source_id: 'id,string', // to calculate hash
			url: '=,string', // to calculate hash
		},
		customMapper: [['content', 'textifyForShort', 'text']],
		query: {
			insert: 'INSERT INTO news_content(hash, content_short) VALUES($1, $2) RETURNING id',
			select: 'SELECT hash FROM news_content',
			delete: 'DELETE FROM news_content WHERE hash=$1',
		},
	},
});

module.exports = getTwitterConfig;
