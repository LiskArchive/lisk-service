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

// Returns the nested property if available, unless returns null
const safeRef = (obj, path) => {
	try {
		if (!path || path === '') return obj;
		return path.split('.').reduce((interimObj, key) => (interimObj && interimObj[key]) ? interimObj[key] : null, obj);
	} catch (e) {
		return null;
	}
};

const getTweetText = (obj) => {
	if (!obj) return null;

	let tweetText = obj.text;
	if (obj.is_quote_status && obj.quoted_status) {
		// Append original quoted status to the re-tweet text
		tweetText = `${obj.text}\n\nQuoted status by ${obj.quoted_status.user.name} (@${obj.quoted_status.user.screen_name}): ${obj.quoted_status.text}`;
	}
	return tweetText;
};

const tweetUrl = (obj) => {
	if (!obj) return undefined;

	let url;
	if (obj.retweeted_status) {
		url = safeRef(obj, 'retweeted_status.entities.urls.0.url');
	} else if (obj.extended_entities) {
		url = safeRef(obj, 'extended_entities.media.0.url');
	} else if (obj.entities) {
		url = safeRef(obj, 'entities.urls.0.url');
	}
	if (!url && obj.id_str) {
		url = `https://twitter.com/i/web/status/${obj.id_str}`;
	}
	return url;
};

const getImageUrl = ({ entities }) => (
	entities.media && entities.media[0] && entities.media[0].media_url_https
);

const tweetMapper = o => ({
	...o,
	text: getTweetText(o),
	url: tweetUrl(o),
	image_url: getImageUrl(o),
	author: safeRef(o, 'user.screen_name'),
});

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

	// For testing
	getTweetText,
};
