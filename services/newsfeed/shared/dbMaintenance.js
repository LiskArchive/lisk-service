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

const newsfeedIndexSchema = require('./schema/newsfeed');

const config = require('../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getIndex = (tableName) => getTableInstance(tableName, newsfeedIndexSchema, MYSQL_ENDPOINT);

const logger = Logger();

const prune = async (source, table, expiryInDays) => {
	const db = await getIndex(table);

	const propBetweens = [{
		property: 'modified_at',
		to: moment().subtract(expiryInDays, 'days').unix(),
	}];

	const result = await db.find({ source, propBetweens });

	logger.debug(`Removing ${result.length} entries from '${table}' index for source '${source}' with '${newsfeedIndexSchema.primaryKey}':\n${result.map(r => r[`${newsfeedIndexSchema.primaryKey}`])}`);
	await db.deleteIds(result.map(r => r[`${newsfeedIndexSchema.primaryKey}`]));
};

module.exports = {
	prune,
};
