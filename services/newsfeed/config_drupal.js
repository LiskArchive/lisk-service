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
	enabled,
	url,
	expiryInDays: Number(process.env.NEWSFEED_DB_EXPIRY_DAYS || 30),
	table: 'newsfeed',
	newsfeed: {
		mapper: {
			source: '=,string',
			source_id: 'nid,string',
			hash: '=,string',
			title: '=,string',
			content_orig: 'description,string',
			content_t: '=,string',
			url: 'link,string',
			image_url: '=,string',
			ctime: '=,number',
			mtime: '=,number',
			author: '=,string',
		},
		customMapper: [
			['ctime', 'drupalUnixTimestamp', 'created'],
			// Update mtime implementation in case modified/updated time exists in response
			['mtime', 'drupalUnixTimestamp', 'created'],
			['content_t', 'textifyForShort', 'description'],
			['author', 'authorParser', 'author'],
			['link', 'drupalDomainPrefixer', 'link'],
			['image_url', 'drupalDomainPrefixer', 'image'],
		],
	},
	filter,
});

module.exports = getDrupalConfig;
