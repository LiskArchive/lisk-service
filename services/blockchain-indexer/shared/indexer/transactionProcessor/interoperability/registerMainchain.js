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

const { getLisk32AddressFromPublicKey } = require('../../../utils/accountUtils');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const blockchainAppsTableSchema = require('../../../database/schema/blockchainApps');
const { TRANSACTION_STATUS } = require('../../../constants');
const { getChainAccount, getMainchainID } = require('../../../dataService');
const { CHAIN_STATUS } = require('../../../dataService/business/interoperability/constants');

const getBlockchainAppsTable = () => getTableInstance(
	blockchainAppsTableSchema.tableName,
	blockchainAppsTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'registerMainchain';

const getChainInfo = async chainID => {
	const chainAccount = await getChainAccount({ chainID });
	const chainStatusInt = chainAccount.status;
	const chainStatus = CHAIN_STATUS[chainStatusInt];
	return {
		chainName: chainAccount.name,
		chainStatus,
	};
};

const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	if (tx.executionStatus !== TRANSACTION_STATUS.SUCCESS) return;

	const blockchainAppsTable = await getBlockchainAppsTable();
	const mainchainID = await getMainchainID({ chainID: tx.params.ownChainID });
	const { chainName, chainStatus } = await getChainInfo(mainchainID);

	logger.trace(`Indexing mainchain (${mainchainID}) registration information.`);
	const appInfo = {
		chainID: mainchainID,
		name: chainName,
		status: chainStatus,
		address: getLisk32AddressFromPublicKey(tx.senderPublicKey),
		lastUpdated: blockHeader.timestamp,
		lastCertificateHeight: blockHeader.height,
	};

	await blockchainAppsTable.upsert(appInfo, dbTrx);
	logger.debug(`Indexed mainchain (${mainchainID}) registration information.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	if (tx.executionStatus !== TRANSACTION_STATUS.SUCCESS) return;

	const blockchainAppsTable = await getBlockchainAppsTable();
	const mainchainID = await getMainchainID({ chainID: tx.params.ownChainID });

	logger.trace(`Reverting mainchain (${mainchainID}) registration information.`);
	await blockchainAppsTable.deleteByPrimaryKey(mainchainID, dbTrx);
	logger.debug(`Reverted mainchain (${mainchainID}) registration information.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
	getChainInfo,
};
