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
const { TRANSACTION_STATUS, EVENT_NAME, CHAIN_STATUS } = require('../../../constants');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const blockchainAppsTableSchema = require('../../../database/schema/blockchainApps');
const { keyExistsInArrayOfObjects } = require('../../../utils/arrayUtils');

const getBlockchainAppsTable = () => getTableInstance(
	blockchainAppsTableSchema.tableName,
	blockchainAppsTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'terminateSidechainForLiveness';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	if (tx.executionStatus !== TRANSACTION_STATUS.SUCCESS) return;

	const blockchainAppsTable = await getBlockchainAppsTable();

	// TODO: Store as CSV (latest 2): state, lastUpdated, lastCertHeight
	const { chainID } = tx.params;
	const appInfo = {
		chainID,
		state: CHAIN_STATUS.TERMINATED,
	};

	logger.trace(`Updating chain ${chainID} state.`);
	await blockchainAppsTable.upsert(appInfo, dbTrx);
	logger.debug(`Updated chain ${chainID} state.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	const blockchainAppsTable = await getBlockchainAppsTable();

	const { chainID } = tx.params;
	const appInfo = {
		chainID,
		state: '', // TODO: Remove `terminated` from CSV
	};

	logger.trace(`Reverting chain ${chainID} state.`);
	await blockchainAppsTable.upsert(appInfo, dbTrx);
	logger.debug(`Reverted chain ${chainID} state.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};
