/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const PgPromise = require('pg-promise');

const logger = Logger();

const config = require('../config');

const pgPromise = PgPromise({
	capSQL: true,
	promiseLib: Promise,
	noLocking: false,
});

const dbQueries = {
	tableName: 'transaction_statistics',
	createTable: `
    CREATE TABLE transaction_statistics (
      id serial PRIMARY KEY,
      timestamp TIMESTAMP NOT NULL,
      volume DOUBLE PRECISION DEFAULT 0,
      count INTEGER DEFAULT 0,
      type SMALLINT NOT NULL,
      amount_range VARCHAR(20) NOT NULL,
      UNIQUE (timestamp, type, amount_range)
    );`,
	insert: `INSERT INTO 
	  transaction_statistics(timestamp, volume, count, type, amount_range) 
	  VALUES($<date>, $<volume>, $<count>, $<type>, $<range>)`,
	selectDay: 'SELECT id FROM transaction_statistics WHERE DATE(timestamp) = $<date> LIMIT 1',
	deleteDay: 'DELETE FROM transaction_statistics WHERE DATE(timestamp) = $<date>',
};

const connectionPool = {};

const getDatabase = () => {
	const endpoint = config.endpoints.postgres;
	if (!connectionPool[endpoint]) {
		connectionPool[endpoint] = pgPromise(endpoint);
		logger.info(`Connected to postgres database: ${endpoint}`);
	}
	return connectionPool[endpoint];
};

module.exports = {
	getDatabase,
	dbQueries,
};
