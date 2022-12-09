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
const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const transactionsTableSchema = require('../../../database/schema/transactions');
const blockchainAppsTableSchema = require('../../../database/schema/blockchainApps');

const getTransactionsTable = () => getTableInstance(
	transactionsTableSchema.tableName,
	transactionsTableSchema,
	MYSQL_ENDPOINT,
);

const getBlockchainAppsTable = () => getTableInstance(
	blockchainAppsTableSchema.tableName,
	blockchainAppsTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'mainchainCCUpdate';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, dbTrx) => {
	const transactionsTable = await getTransactionsTable();
	const blockchainAppsTable = await getBlockchainAppsTable();

	logger.trace(`Indexing cross chain update transaction ${tx.id} contained in block at height ${tx.height}.`);

	tx.moduleCommand = `${tx.module}:${tx.crossChainCommand}`;

	// TODO: Get more apps information directly from SDK once issue https://github.com/LiskHQ/lisk-sdk/issues/7225 is closed
	const appInfo = {
		chainID: tx.sendingChainID,
		state: tx.status, // TODO: Verify and update
		address: '', // TODO: Verify and update address
		lastCertificateHeight: '',
		lastUpdated: '',
	};

	await blockchainAppsTable.upsert(appInfo, dbTrx);
	await transactionsTable.upsert(tx, dbTrx);
	logger.debug(`Indexed cross chain update transaction ${tx.id} contained in block at height ${tx.height}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, dbTrx) => {
	// TODO: Implement
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};
