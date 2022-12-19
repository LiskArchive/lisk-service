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
const moment = require('moment');
const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const newsfeedTableSchema = require('./schema/newsfeed');

const config = require('../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getNewsFeedTable = (tableName) => getTableInstance(
	tableName,
	newsfeedTableSchema,
	MYSQL_ENDPOINT,
);

const logger = Logger();

const prune = async (source, tableName, expiryInDays) => {
	const newsfeedTable = await getNewsFeedTable(tableName);

	const propBetweens = [{
		property: 'modified_at',
		to: moment().subtract(expiryInDays, 'days').unix(),
	}];

	const result = await newsfeedTable.find({ source, propBetweens });

	logger.debug(`Removing ${result.length} entries from '${tableName}' index for source '${source}' with '${newsfeedTableSchema.primaryKey}':\n${result.map(r => r[`${newsfeedTableSchema.primaryKey}`])}`);
	await newsfeedTable.deleteByPrimaryKey(result.map(r => r[`${newsfeedTableSchema.primaryKey}`]));
};

module.exports = {
	prune,
};
