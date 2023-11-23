/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
/* eslint-disable operator-linebreak */
const Logger = require('../../logger').get;

const logger = Logger();

const util = require('../util');

const CONN_ENDPOINT_DEFAULT = 'mysql://lisk:password@127.0.0.1:3306/lisk';

const connectionPool = {};
const tablePool = {};

const createDBConnection = async connEndpoint => {
	const knex = require('knex')({
		client: 'mysql2',
		version: '8',
		connection: connEndpoint,
		useNullAsDefault: true,
		pool: {
			max: 100,
			min: 2,
		},
		log: {
			warn(message) {
				logger.warn(message);
			},
			error(message) {
				logger.error(message);
			},
			deprecate(message) {
				logger.warn(message);
			},
			debug(message) {
				logger.debug(message);
			},
		},
	});

	knex
		.select(1)
		.on('query-error', error => {
			logger.error(error.message);
		})
		.catch(err => {
			if (err.code === 'ECONNREFUSED') {
				logger.error(err.message);
				logger.fatal('Unable to connect to the database, shutting down the process...');
				process.exit(1);
			}
			logger.error(err.message);
		});

	return knex;
};

const getConnectionPoolKey = (connEndpoint = CONN_ENDPOINT_DEFAULT) => {
	const userName = connEndpoint.split('//')[1].split('@')[0].split(':')[0];
	const [hostPort, dbName] = connEndpoint.split('@')[1].split('/');
	const connPoolKey = `${userName}@${hostPort}/${dbName}`;
	return connPoolKey;
};

const getDBConnection = async (connEndpoint = CONN_ENDPOINT_DEFAULT) => {
	const connPoolKey = getConnectionPoolKey(connEndpoint);
	const defaultCharset = 'utf8mb4';

	if (!connectionPool[connPoolKey]) {
		logger.info(`Attempting to connect ${connEndpoint}...`);
		let connString = connEndpoint;
		if (!connEndpoint.includes('charset')) {
			connString = connEndpoint.includes('?')
				? `${connEndpoint}&charset=${defaultCharset}`
				: `${connEndpoint}?charset=${defaultCharset}`;
		}
		connectionPool[connPoolKey] = await createDBConnection(connString);
	}

	const knex = connectionPool[connPoolKey];
	return knex;
};

const createTableIfNotExists = async (tableConfig, connEndpoint = CONN_ENDPOINT_DEFAULT) => {
	const { tableName } = tableConfig;

	const connPoolKey = getConnectionPoolKey(connEndpoint);
	const connPoolKeyTable = `${connPoolKey}/${tableName}`;

	if (!tablePool[connPoolKeyTable]) {
		const knex = await getDBConnection(connEndpoint);
		await util.loadSchema(knex, tableName, tableConfig);
		tablePool[connPoolKeyTable] = true;
	}
};

const getTableInstance = async (...tableParams) => {
	const tableConfig = tableParams.find(item => typeof item === 'object');
	const connEndpoint =
		tableParams.find(item => typeof item === 'string' && item.startsWith('mysql:')) ||
		CONN_ENDPOINT_DEFAULT;
	const tableName =
		tableParams.find(item => typeof item === 'string' && !item.startsWith('mysql:')) ||
		tableConfig.tableName;
	tableConfig.tableName = tableName;

	const knex = await getDBConnection(connEndpoint);

	await createTableIfNotExists(tableConfig, connEndpoint);

	const dbOperations = util.getTableInstance(tableConfig, knex);

	return {
		...dbOperations,
	};
};

module.exports = {
	default: getTableInstance,
	getDBConnection,
	getTableInstance,
	startDBTransaction: util.startDBTransaction,
	commitDBTransaction: util.commitDBTransaction,
	rollbackDBTransaction: util.rollbackDBTransaction,
	createTableIfNotExists,
	CONN_ENDPOINT_DEFAULT,

	// For backward compatibility
	getDbConnection: getDBConnection,
	startDbTransaction: util.startDBTransaction,
	commitDbTransaction: util.commitDBTransaction,
	rollbackDbTransaction: util.rollbackDBTransaction,
};
