/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const { Signals } = require('lisk-service-framework');
const { getNewsfeed } = require('../methods/controllers/newsfeed');

const SOURCE = { TWITTER: 'twitter', DRUPAL: 'drupal' };
const isReady = { TWITTER: false, DRUPAL: false };

module.exports = [
	{
		name: 'newsfeed.Ready',
		description: 'Returns current readiness status of newsfeed microservice',
		controller: async callback => {
			const newsfeedServiceReadyListener = async (source) => {
				if (source === SOURCE.DRUPAL) {
					const drupalFeed = await getNewsfeed({ source: 'drupal_lisk_general,drupal_lisk_announcements' });
					isReady.DRUPAL = !!drupalFeed.data.length;
				} else if (source === SOURCE.TWITTER) {
					if (!process.env.TWITTER_ACCESS_TOKEN_KEY) isReady.TWITTER = true;
					else {
						const twitterFeed = await getNewsfeed({ source: 'twitter_lisk' });
						isReady.TWITTER = !!twitterFeed.data.length;
					}
				}

				const status = Object.values(isReady).every(entry => entry);
				callback(status);
			};
			const drupalFeedReadyListener = newsfeedServiceReadyListener.bind(null, SOURCE.DRUPAL);
			const twitterFeedReadyListener = newsfeedServiceReadyListener.bind(null, SOURCE.TWITTER);

			Signals.get('drupalFeedReady').add(drupalFeedReadyListener);
			Signals.get('twitterFeedReady').add(twitterFeedReadyListener);
		},
	},
];
