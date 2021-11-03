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
const { Logger } = require('lisk-service-framework');

const { normalizeData } = require('../shared/normalizers');
const { getData } = require('../shared/twitter');

const mysqlIndex = require('../shared/indexdb/mysql');
const newsfeedIndexSchema = require('../shared/schema/newsfeed');
const config = require('../config');

const logger = Logger();

const getNewsFeedIndex = () => mysqlIndex(config.sources.twitter_lisk.table, newsfeedIndexSchema);

const refreshTwitterData = async () => {
	logger.debug('Updating Twitter data...');
	const newsfeedDB = await getNewsFeedIndex();

	const response = await getData();
	const normalizedData = normalizeData(config.sources.twitter_lisk, response);
	await newsfeedDB.upsert(normalizedData);
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
