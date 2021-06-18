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
const config = require('../../config.js');

const enabledSources = Object.values(config.sources)
	.filter(({ enabled }) => enabled)
	.map(({ name }) => name);

const getNewsfeed = async ({ limit, offset, source = enabledSources }) => {
	// Replace it once done with implementation
	const data = [
		{
			author: 'LiskHQ',
			content: 'RT @newsbtc: Lisk.js 2021 Recap https://t.co/QpZOkBfrgA',
			imageUrl: 'https://t.co/QpZOkBfrgA.jpg',
			sourceName: 'twitter_lisk',
			sourceId: '4584a7d2db15920e130eeaf1014f87c99b5af329',
			timestamp: 1623053809,
			ctime: 1623053809,
			mtime: 1623053809,
			title: 'Financial Update for January 2021',
			url: 'https://t.co/QpZOkBfrgA',
			image_url: 'https://t.co/QpZOkBfrgA.jpg', // for compatiblity
		},
	];

	return {
		data,
		meta: {
			count: data.length,
			limit,
			offset,
			source,
		},
		links: {},
	};
};

module.exports = {
	getNewsfeed,
};
