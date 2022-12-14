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
const blockchainAppsTableSchema = require('../../../database/schema/blockchainApps');

const getBlockchainAppsTable = () => getTableInstance(
	blockchainAppsTableSchema.tableName,
	blockchainAppsTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'sidechainCCUpdate';

const applyTransaction = async (blockHeader, tx, dbTrx) => {
	const blockchainAppsTable = await getBlockchainAppsTable();

	logger.trace(`Indexing cross chain update transaction ${tx.id} contained in block at height ${tx.height}.`);

	// TODO: Get more apps information directly from SDK once issue https://github.com/LiskHQ/lisk-sdk/issues/7225 is closed
	// TODO: Store as CSV (latest 2): state, lastUpdated, lastCertHeight
	const appInfo = {
		chainID: tx.params.sendingChainID,
		state: '', // TODO: Update chain status from events
		address: '',
		lastUpdated: blockHeader.timestamp,
		lastCertificateHeight: blockHeader.height,
	};

	await blockchainAppsTable.upsert(appInfo, dbTrx);
	logger.debug(`Indexed cross chain update transaction ${tx.id} contained in block at height ${tx.height}.`);
};

const revertTransaction = async (blockHeader, tx, dbTrx) => {
	const blockchainAppsTable = await getBlockchainAppsTable();

	logger.trace(`Reverting cross chain update transaction ${tx.id} contained in block at height ${tx.height}.`);

	// TODO: Get more apps information directly from SDK once issue https://github.com/LiskHQ/lisk-sdk/issues/7225 is closed
	// TODO: Remove the last value (keep oldest if 2 values exist): state, lastUpdated, lastCertHeight
	const appInfo = {
		chainID: tx.params.sendingChainID,
		state: '',
		address: '',
		lastUpdated: blockHeader.timestamp,
		lastCertificateHeight: blockHeader.height,
	};

	await blockchainAppsTable.upsert(appInfo, dbTrx);
	logger.debug(`Reverted cross chain update transaction ${tx.id} contained in block at height ${tx.height}.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};
