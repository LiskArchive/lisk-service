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
const { normalizeData, normalizeFunctions } = require('../../shared/normalizers');
const { drupalData } = require('../constants/newsfeed');
const { newsfeedArticleSchema } = require('../schemas/newsfeedArticle.schema');
const config = require('../../config');

const encodedHtmlContent = 'Decode known &quot;HTML special characters&quot; with the htmlEntities&apos;s &lt;decode&gt; method &amp; test your implementation successfully.';
const expectedDecodedOutput = 'Decode known "HTML special characters" with the htmlEntities\'s <decode> method & test your implementation successfully.';

describe('Test normalizers', () => {
	it('Test normalizeData', async () => {
		const result = await normalizeData(config.sources.drupal_lisk_announcements, drupalData);
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(drupalData.length);
		result.forEach(article => newsfeedArticleSchema.validate(article));
	});

	it('Test textify - 1', async () => {
		const html = '<h1>Hello World</h1>';
		const text = normalizeFunctions.textify(html);
		expect(text).toBe('HELLO WORLD');
	});

	it('Test textify - 2', async () => {
		const html = '<marquee>Hello World</marquee>';
		const text = normalizeFunctions.textify(html);
		expect(text).toBe('Hello World');
	});

	it('Test convertTime', async () => {
		const unixTimeZero = '01 Jan 1970 00:00:00 GMT';
		const convertedTime = normalizeFunctions.convertTime(unixTimeZero);
		expect(convertedTime).toBe('1970-01-01 00:00:00');
	});

	it('Test htmlEntitiesDecode', async () => {
		const decodedContent = normalizeFunctions.htmlEntitiesDecode(encodedHtmlContent);
		expect(decodedContent).toBe(expectedDecodedOutput);
	});

	it('Test drupalContentParser', async () => {
		const encodedContent = `\n\n\n\nPre-comment content. /** Drupal block comment */\n\n\n\n\n\n\nPost-comment content. Now, ${encodedHtmlContent}\n\n\n\n`;
		const expectedOutput = `Pre-comment content. \n\nPost-comment content. Now, ${expectedDecodedOutput}`;

		const parsedContent = normalizeFunctions.drupalContentParser(encodedContent);
		expect(parsedContent).toBe(expectedOutput);
	});

	it('Test authorParser', async () => {
		let result = await normalizeFunctions.authorParser(drupalData[0].author);
		expect(['Lisk', drupalData[0].author]).toContain(result);

		result = await normalizeFunctions.authorParser('admin');
		expect(result).toEqual('Lisk');
	});

	it('Test drupalDomainPrefixer', async () => {
		const result = await normalizeFunctions
			.drupalDomainPrefixer(drupalData[0].link, config.sources.drupal_lisk_announcements);
		expect(result).toBe('https://lisk.com/blog/announcement/introducing-lisk-community-squad');
	});

	it('Test textifyForShort', async () => {
		const result = await normalizeFunctions.textifyForShort(drupalData[0].description);
		expect(result.length).toBeLessThanOrEqual(config.defaultNewsLength);
	});

	xit('Test drupalUnixTimestamp', async () => {
		const result = normalizeFunctions.drupalUnixTimestamp('06/30/2021 - 10:04');
		expect(result).toEqual(1625040240);
	});

	it('Test twitterUnixTimestamp', async () => {
		const result = normalizeFunctions.twitterUnixTimestamp('Wed Jun 30 10:04:55 +0000 2021');
		expect(result).toEqual(1625047495);
	});
});
