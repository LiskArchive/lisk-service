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
const twitterMethods = require('../../shared/twitter');

const {
	safeRef,
	getImageUrl,
	getTweetText,
	tweetMapper,
	tweetUrl,
} = twitterMethods;

const {
	tweetObject,
	retweetObject,
	mediaTweetObject,
	otherTweetObject,
} = require('../constants/newsfeed');

describe('Test safeRef method', () => {
	it('should return correct response when called with tweet', async () => {
		const url = 'entities.urls.0.url';
		const result = safeRef(tweetObject, url);
		expect(result).toBe(tweetObject.entities.urls[0].url);
	});

	it('should return correct response when called with retweet', async () => {
		const url = 'retweeted_status.entities.urls.0.url';
		const result = safeRef(retweetObject, url);
		expect(result).toBe(retweetObject.retweeted_status.entities.urls[0].url);
	});

	it('should return correct response when called with mediaTweet', async () => {
		const url = 'extended_entities.media.0.url';
		const result = safeRef(mediaTweetObject, url);
		expect(result).toBe(mediaTweetObject.extended_entities.media[0].url);
	});

	it('should return null response when called with invalid path', async () => {
		const url = 'invalid.path';
		const result = safeRef(mediaTweetObject, url);
		expect(result).toBe(null);
	});

	it('should return obj response when called with undefined path', async () => {
		const result = safeRef(tweetObject, undefined);
		expect(result).toEqual(tweetObject);
	});

	it('should return obj response when called with null path', async () => {
		const result = safeRef(tweetObject, null);
		expect(result).toEqual(tweetObject);
	});

	it('should return obj response when called with undefined obj', async () => {
		const url = 'entities.urls.0.url';
		const result = safeRef(undefined, url);
		expect(result).toEqual(null);
	});

	it('should return obj response when called with null obj', async () => {
		const url = 'entities.urls.0.url';
		const result = safeRef(null, url);
		expect(result).toEqual(null);
	});
});

describe('Test getImageUrl method', () => {
	it('should return undefined when called with tweet', async () => {
		const url = getImageUrl(tweetObject);
		expect(url).toBe(undefined);
	});

	it('should return undefined when called with retweet', async () => {
		const url = getImageUrl(retweetObject);
		expect(url).toBe(undefined);
	});

	it('should return image url when called with mediaTweet', async () => {
		const url = getImageUrl(mediaTweetObject);
		expect(url).toBe(mediaTweetObject.entities.media[0].media_url_https);
	});

	it('should return undefined when called with otherTweet', async () => {
		const url = getImageUrl(otherTweetObject);
		expect(url).toBe(undefined);
	});

	it('should return correct url when called with an object having entities.media[0].media_url_https', async () => {
		const obj = {
			entities: {
				media: [{
					media_url_https: 'expected_url',
				}],
			},
		};
		const url = getImageUrl(obj);
		expect(url).toBe(obj.entities.media[0].media_url_https);
	});
});

describe('Test getTweetText method', () => {
	it('should return obj.text when called with tweet', async () => {
		const url = getTweetText(tweetObject);
		expect(url).toBe(tweetObject.text);
	});

	it('should return undefined when called with retweet', async () => {
		const url = getTweetText(retweetObject);
		expect(url).toBe(retweetObject.text);
	});

	it('should return image url when called with mediaTweet', async () => {
		const url = getTweetText(mediaTweetObject);
		expect(url).toBe(mediaTweetObject.text);
	});

	it('should return undefined when called with otherTweet', async () => {
		const url = getTweetText(otherTweetObject);
		expect(url).toBe(otherTweetObject.text);
	});

	it('should return text with quote information when called with an object having is_quote_status and quoted_status', async () => {
		const obj = {
			text: 'custom tweet text',
			is_quote_status: true,
			quoted_status: {
				text: 'custom_quoted_text',
				user: {
					name: 'user_name',
					screen_name: 'user_screen_name',
				},
			},
		};
		const expectedText = `${obj.text}\n\nQuoted status by ${obj.quoted_status.user.name} (@${obj.quoted_status.user.screen_name}): ${obj.quoted_status.text}`;
		const url = getTweetText(obj);
		expect(url).toBe(expectedText);
	});

	it('should return null when called with null object', async () => {
		const url = getTweetText(null);
		expect(url).toBe(null);
	});

	it('should return null when called with undefined object', async () => {
		const url = getTweetText(undefined);
		expect(url).toBe(null);
	});
});

describe('Test tweetMapper method', () => {
	it('should return correct response when called with tweet', async () => {
		const mappedTweet = tweetMapper(tweetObject);
		expect(mappedTweet).toEqual(
			expect.objectContaining({
				url: expect.any(String),
				image_url: undefined,
				author: expect.any(String),
			}),
		);
	});

	it('should return correct response when called with retweet', async () => {
		const mappedTweet = tweetMapper(retweetObject);
		expect(mappedTweet).toEqual(
			expect.objectContaining({
				url: expect.any(String),
				image_url: undefined,
				author: expect.any(String),
			}),
		);
	});

	it('should return correct response when called with mediaTweet', async () => {
		const mappedTweet = tweetMapper(mediaTweetObject);
		expect(mappedTweet).toEqual(
			expect.objectContaining({
				url: expect.any(String),
				image_url: expect.any(String),
				author: expect.any(String),
			}),
		);
	});

	it('should return correct response when called with otherTweet', async () => {
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

describe('Test tweetUrl method', () => {
	it('should return correct url when obj has retweeted_status property', async () => {
		jest.spyOn(twitterMethods, 'safeRef').mockReturnValueOnce(retweetObject.retweeted_status.entities.urls[0].url);
		const url = tweetUrl(retweetObject);
		expect(url).toBe(retweetObject.retweeted_status.entities.urls[0].url);
	});

	it('should return correct url when obj has entities property', async () => {
		jest.spyOn(twitterMethods, 'safeRef').mockReturnValueOnce(tweetObject.entities.urls[0].url);
		const url = tweetUrl(tweetObject);
		expect(url).toBe(tweetObject.entities.urls[0].url);
	});

	it('should return correct url when obj has extended_entities property', async () => {
		jest.spyOn(twitterMethods, 'safeRef').mockReturnValueOnce(mediaTweetObject.extended_entities.media[0].url);
		const url = tweetUrl(mediaTweetObject);
		expect(url).toBe(mediaTweetObject.extended_entities.media[0].url);
	});

	it('should return correct url when obj has id_str property', async () => {
		const url = tweetUrl(otherTweetObject);
		expect(url).toBe(`https://twitter.com/i/web/status/${otherTweetObject.id_str}`);
	});

	it('should return undefined url when obj is empty', async () => {
		const url = tweetUrl({});
		expect(url).toBe(undefined);
	});

	it('should return undefined url when obj is undefined', async () => {
		const url = tweetUrl(undefined);
		expect(url).toBe(undefined);
	});

	it('should return undefined url when obj is null', async () => {
		const url = tweetUrl(null);
		expect(url).toBe(undefined);
	});
});
