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
const getDrupalConfig = require('./shared/newsfeed/sources/config_drupal');
const getTwitterConfig = require('./shared/newsfeed/sources/config_twitter');

module.exports = {
	lisk_blog_rest_general: getDrupalConfig({
		enabled: true,
		name: 'drupal_lisk_general',
		url: 'https://lisk.io/api/blog',
		filter: item => item.category !== 'Announcement' && item.description !== '',
	}),
	lisk_blog_rest_announcements: getDrupalConfig({
		enabled: true,
		name: 'drupal_lisk_announcements',
		url: 'https://lisk.io/api/blog/43',
		filter: item => item.description !== '',
	}),
	twitter_lisk: getTwitterConfig({
		enabled: true,
		name: 'twitter_lisk',
	}),
};
