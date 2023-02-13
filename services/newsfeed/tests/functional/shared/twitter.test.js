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
const { tweetMapper, tweetUrl } = require('../../../shared/twitter');
const {
	tweetObject,
	retweetObject,
	mediaTweetObject,
	otherTweetObject,
} = require('../../constants/newsfeed');

describe('Test tweetMapper method', () => {
	it('should return correct response when called with tweet', async () => {
		const mappedTweet = tweetMapper(tweetObject);
		expect(mappedTweet).toEqual({
			...tweetObject,
			text: tweetObject.text,
			url: tweetObject.entities.urls[0].url,
			image_url: undefined,
			author: tweetObject.user.screen_name,
		});
	});

	it('should return correct response when called with retweet', async () => {
		const mappedTweet = tweetMapper(retweetObject);
		expect(mappedTweet).toEqual({
			...retweetObject,
			text: retweetObject.text,
			url: retweetObject.retweeted_status.entities.urls[0].url,
			image_url: undefined,
			author: retweetObject.user.screen_name,
		});
	});

	it('should return correct response when called with mediaTweet', async () => {
		const mappedTweet = tweetMapper(mediaTweetObject);
		expect(mappedTweet).toEqual({
			...mediaTweetObject,
			text: mediaTweetObject.text,
			url: mediaTweetObject.extended_entities.media[0].url,
			image_url: mediaTweetObject.entities.media[0].media_url_https,
			author: mediaTweetObject.user.screen_name,
		});
	});

	it('should return correct response when called with otherTweet', async () => {
		const mappedTweet = tweetMapper(otherTweetObject);
		expect(mappedTweet).toEqual({
			...otherTweetObject,
			text: otherTweetObject.text,
			url: `https://twitter.com/i/web/status/${otherTweetObject.id_str}`,
			image_url: undefined,
			author: otherTweetObject.user.screen_name,
		});
	});

	it('should throw error when called with empty object', async () => {
		expect(() => tweetMapper({})).toThrow();
	});

	it('should throw error when called with null object', async () => {
		expect(() => tweetMapper(null)).toThrow();
	});

	it('should throw error when called with undefined object', async () => {
		expect(() => tweetMapper()).toThrow();
	});
});

describe('Test tweetUrl method', () => {
	it('should return correct url when called with tweet', async () => {
		const url = tweetUrl(tweetObject);
		expect(url).toBe(tweetObject.entities.urls[0].url);
	});

	it('should return correct url when called with retweet', async () => {
		const url = tweetUrl(retweetObject);
		expect(url).toBe(retweetObject.retweeted_status.entities.urls[0].url);
	});

	it('should return correct url when called with mediaTweet', async () => {
		const url = tweetUrl(mediaTweetObject);
		expect(url).toBe(mediaTweetObject.extended_entities.media[0].url);
	});

	it('should return correct url when called with other tweet', async () => {
		const url = tweetUrl(otherTweetObject);
		expect(url).toBe(`https://twitter.com/i/web/status/${otherTweetObject.id_str}`);
	});

	it('should return undefined url when obj is empty', async () => {
		const url = tweetUrl({});
		expect(url).toBe(undefined);
	});

	it('should throw error when obj is null', async () => {
		expect(() => tweetUrl(null)).toThrow();
	});

	it('should throw error when obj is undefined', async () => {
		expect(() => tweetUrl(undefined)).toThrow();
	});
});
