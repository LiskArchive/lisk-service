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
const Twitter = require('twitter');

const config = require('../config');

const client = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const safeRef = (obj, path) => {
	try {
		return path.split('.').reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, obj);
	} catch (e) {
		return null;
	}
};

const tweetUrl = (o) => {
	let url;
	if (o.retweeted_status) {
		url = safeRef(o, 'retweeted_status.entities.urls.0.url');
	} else if (o.extended_entities) {
		url = safeRef(o, 'extended_entities.media.0.url');
	} else if (o.entities) {
		url = safeRef(o, 'entities.urls.0.url');
	}
	if (!url && o.id_str) {
		url = `https://twitter.com/i/web/status/${o.id_str}`;
	}
	return url;
};

const getImageUrl = ({ entities }) => (
	entities.media && entities.media[0] && entities.media[0].media_url_https
);

const tweetMapper = o => {
	const tweet = {
		...o,
		url: tweetUrl(o),
		image_url: getImageUrl(o),
		author: safeRef(o, 'user.screen_name'),
	};

	if (o.is_quote_status && o.quoted_status) {
		// Append original quoted status to the re-tweet text
		tweet.text = `${o.text}\n\nQuoted status by ${o.quoted_status.user.name} (@${o.quoted_status.user.screen_name}): ${o.quoted_status.text}`;
	}

	return tweet;
};

const getData = () => new Promise((resolve, reject) => {
	const { url, requestOptions } = config.sources.twitter_lisk;

	client.get(url, requestOptions, (error, tweets) => {
		if (error) {
			return reject(error);
		}

		return resolve(
			tweets
				.filter(o => o.in_reply_to_status_id === null)
				.map(tweetMapper),
		);
	});
});

module.exports = {
	safeRef,
	tweetUrl,
	getImageUrl,
	tweetMapper,
	getData,
};
