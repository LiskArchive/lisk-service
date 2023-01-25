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
	HTTP: { request: requestLib },
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const { normalizeData } = require('../shared/normalizers');

const newsfeedIndexSchema = require('../shared/schema/newsfeed');
const config = require('../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const logger = Logger();

const getNewsFeedIndex = () => getTableInstance(
	newsfeedIndexSchema.tableName,
	newsfeedIndexSchema,
	MYSQL_ENDPOINT,
);

const reloadNewsFromDrupal = async drupalSources => {
	const newsfeedDB = await getNewsFeedIndex();

	drupalSources.forEach(async source => {
		const response = await requestLib(source.url);
		const normalizedData = response ? normalizeData(source, response.data) : [];
		await newsfeedDB.upsert(normalizedData);
	});
};

const performUpdate = async () => {
	logger.debug('Updating Drupal data...');
	await reloadNewsFromDrupal([
		config.sources.drupal_lisk_announcements,
		config.sources.drupal_lisk_general,
	]);
};

module.exports = [
	{
		name: 'newsfeed.retrieve.drupal',
		description: 'Retrieves data from Drupal',
		interval: config.sources.drupal_lisk_general.interval,
		init: performUpdate,
		controller: performUpdate,
	},
];
