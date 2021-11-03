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
const {
	safeRef,
	tweetUrl,
	getImageUrl,
	tweetMapper,
} = require('../../shared/twitter');

const {
	tweetObject,
	retweetObject,
	mediaTweetObject,
	otherTweetObject,
} = require('../constants/newsfeed');

describe('Test twitter functions', () => {
	it('Test safeRef - tweet', async () => {
		const url = 'entities.urls.0.url';
		const result = safeRef(tweetObject, url);
		expect(result).toBe(tweetObject.entities.urls[0].url);
	});

	it('Test safeRef - retweet', async () => {
		const url = 'retweeted_status.entities.urls.0.url';
		const result = safeRef(retweetObject, url);
		expect(result).toBe(retweetObject.retweeted_status.entities.urls[0].url);
	});

	it('Test safeRef - mediaTweet', async () => {
		const url = 'extended_entities.media.0.url';
		const result = safeRef(mediaTweetObject, url);
		expect(result).toBe(mediaTweetObject.extended_entities.media[0].url);
	});

	it('Test tweetUrl - tweet', async () => {
		const url = tweetUrl(tweetObject);
		expect(url).toBe(tweetObject.entities.urls[0].url);
	});

	it('Test tweetUrl - retweet', async () => {
		const url = tweetUrl(retweetObject);
		expect(url).toBe(retweetObject.retweeted_status.entities.urls[0].url);
	});

	it('Test tweetUrl - mediaTweet', async () => {
		const url = tweetUrl(mediaTweetObject);
		expect(url).toBe(mediaTweetObject.extended_entities.media[0].url);
	});

	it('Test tweetUrl - otherTweet', async () => {
		const url = tweetUrl(otherTweetObject);
		expect(url).toBe(`https://twitter.com/i/web/status/${otherTweetObject.id_str}`);
	});

	it('Test getImageUrl - tweet', async () => {
		const url = getImageUrl(tweetObject);
		expect(url).toBe(undefined);
	});

	it('Test getImageUrl - retweet', async () => {
		const url = getImageUrl(tweetObject);
		expect(url).toBe(undefined);
	});

	it('Test getImageUrl - mediaTweet', async () => {
		const url = getImageUrl(mediaTweetObject);
		expect(url).toBe(mediaTweetObject.entities.media[0].media_url_https);
	});

	it('Test getImageUrl - otherTweet', async () => {
		const url = getImageUrl(otherTweetObject);
		expect(url).toBe(undefined);
	});

	it('Test tweetMapper - tweet', async () => {
		const mappedTweet = tweetMapper(tweetObject);
		expect(mappedTweet).toEqual(
			expect.objectContaining({
				url: expect.any(String),
				image_url: undefined,
				author: expect.any(String),
			}),
		);
	});

	it('Test tweetMapper - retweet', async () => {
		const mappedTweet = tweetMapper(retweetObject);
		expect(mappedTweet).toEqual(
			expect.objectContaining({
				url: expect.any(String),
				image_url: undefined,
				author: expect.any(String),
			}),
		);
	});

	it('Test tweetMapper - mediaTweet', async () => {
		const mappedTweet = tweetMapper(mediaTweetObject);
		expect(mappedTweet).toEqual(
			expect.objectContaining({
				url: expect.any(String),
				image_url: expect.any(String),
				author: expect.any(String),
			}),
		);
	});

	it('Test tweetMapper - otherTweet', async () => {
		const mappedTweet = tweetMapper(otherTweetObject);
		expect(mappedTweet).toEqual(
			expect.objectContaining({
				url: expect.any(String),
				image_url: undefined,
				author: expect.any(String),
			}),
		);
	});
});
