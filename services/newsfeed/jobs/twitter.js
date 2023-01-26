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
const { Logger, MySQL: { getTableInstance } } = require('lisk-service-framework');

const { normalizeData } = require('../shared/normalizers');
const { getData } = require('../shared/twitter');

const newsfeedIndexSchema = require('../shared/schema/newsfeed');
const config = require('../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const logger = Logger();

const getNewsFeedTable = () => getTableInstance(
	newsfeedIndexSchema.tableName,
	newsfeedIndexSchema,
	MYSQL_ENDPOINT,
);

const refreshTwitterData = async () => {
	try {
		logger.debug('Updating Twitter data...');
		const newsfeedTable = await getNewsFeedTable();

		const response = await getData();
		const normalizedData = response ? normalizeData(config.sources.twitter_lisk, response) : [];
		await newsfeedTable.upsert(normalizedData);
	} catch (error) {
		let errorMsg = error.message;
		if (Array.isArray(error)) errorMsg = error.map(e => e.message).join('\n');
		logger.error(`Unable to retrieve data from Twitter: ${errorMsg}`);
	}
};

module.exports = [
	{
		name: 'newsfeed.retrieve.twitter',
		description: 'Retrieves data from Twitter',
		interval: config.sources.twitter_lisk.interval,
		init: refreshTwitterData,
		controller: refreshTwitterData,
	},
];
