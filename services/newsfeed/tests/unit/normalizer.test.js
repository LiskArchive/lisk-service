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

describe('Test normalizers', () => {
	it('Test normalizeData', async () => {
		const result = await normalizeData(config.sources.drupal_lisk_announcements, drupalData);
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(drupalData.length);
		result.forEach(article => newsfeedArticleSchema.validate(article));
	});

	it('Test authorParser', async () => {
		let result = await normalizeFunctions.authorParser(drupalData[0].author);
		expect(['Lisk', drupalData[0].author]).toContain(result);

		result = await normalizeFunctions.authorParser('admin');
		expect(['Lisk', drupalData[0].author]).toContain(result);
	});

	it('Test drupalDomainPrefixer', async () => {
		const result = await normalizeFunctions
			.drupalDomainPrefixer(drupalData[0].link, config.sources.drupal_lisk_announcements);
		expect(result).toBe('https://lisk.io/blog/announcement/introducing-lisk-community-squad');
	});

	it('Test textifyForShort', async () => {
		const result = await normalizeFunctions.textifyForShort(drupalData[0].description);
		expect(result.length).toBeLessThanOrEqual(config.defaultNewsLength);
	});
});
