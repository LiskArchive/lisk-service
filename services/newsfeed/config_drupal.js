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
const getDrupalConfig = ({ enabled, name, url, filter }) => ({
	name,
	type: 'rest',
	enabled,
	url,
	interval: 5 * 60, // seconds
	newsfeed: {
		mapper: {
			source: '=,string',
			source_id: 'nid,string',
			hash: '=,string',
			title: '=,string',
			content: 'description,string',
			url: 'link,string',
			image_url: '=,string',
			ctime: '=',
			author: '=,string',
		},
		customMapper: [
			['ctime', 'drupalDate', 'created'],
			['author', 'authorParser', 'author'],
			['link', 'drupalDomainPrefixer', 'link'],
			['image_url', 'drupalDomainPrefixer', 'image'],
		],
		query: {
			insert: `INSERT INTO newsfeed(source, source_id, hash, title, content, url, image_url, timestamp, author) 
					   VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
			select: `SELECT hash FROM newsfeed WHERE source='${name}' LIMIT 200`,
			delete: 'DELETE FROM newsfeed WHERE hash=$1',
		},
	},
	news_content: {
		mapper: {
			hash: '=,string',
			content: 'description,string',
			source: '=,string', // to calculate hash
			source_id: 'nid,string', // to calculate hash
			url: 'link,string', // to calculate hash
		},
		customMapper: [
			['link', 'drupalDomainPrefixer', 'link'], // to calculate hash
		],
		query: {
			insert: 'INSERT INTO news_content(hash, content_short) VALUES($1, $2) RETURNING id',
			select: 'SELECT hash FROM news_content',
			delete: 'DELETE FROM news_content WHERE hash=$1',
		},
	},
	filter,
});

module.exports = getDrupalConfig;
