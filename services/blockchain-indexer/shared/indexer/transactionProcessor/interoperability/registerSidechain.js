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

const { getLisk32AddressFromPublicKey } = require('../../../utils/account');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysqlPrimary;
const blockchainAppsTableSchema = require('../../../database/schema/blockchainApps');
const { TRANSACTION_STATUS } = require('../../../constants');
const { getChainInfo } = require('./registerMainchain');

const getBlockchainAppsTable = () => getTableInstance(
	blockchainAppsTableSchema.tableName,
	blockchainAppsTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'registerSidechain';

const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	if (tx.executionStatus !== TRANSACTION_STATUS.SUCCESS) return;

	const blockchainAppsTable = await getBlockchainAppsTable();
	const chainInfo = await getChainInfo(tx.params.chainID);

	logger.trace(`Indexing sidechain (${tx.params.chainID}) registration information.`);
	const appInfo = {
		chainID: tx.params.chainID,
		chainName: tx.params.name,
		status: chainInfo.status,
		address: getLisk32AddressFromPublicKey(tx.senderPublicKey),
		lastUpdated: blockHeader.timestamp,
		lastCertificateHeight: blockHeader.height,
	};

	await blockchainAppsTable.upsert(appInfo, dbTrx);
	logger.debug(`Indexed sidechain (${tx.params.chainID}) registration information.`);
};

const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	if (tx.executionStatus !== TRANSACTION_STATUS.SUCCESS) return;

	const blockchainAppsTable = await getBlockchainAppsTable();

	logger.trace(`Reverting sidechain (${tx.params.chainID}) registration information.`);
	await blockchainAppsTable.deleteByPrimaryKey(tx.params.chainID, dbTrx);
	logger.debug(`Reverted sidechain (${tx.params.chainID}) registration information.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};
