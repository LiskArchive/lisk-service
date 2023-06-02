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
const { TRANSACTION_STATUS } = require('../../../constants');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const blockchainAppsTableSchema = require('../../../database/schema/blockchainApps');
const ccuTableSchema = require('../../../database/schema/ccu');
const transactionsTableSchema = require('../../../database/schema/transactions');

const { getChainInfo } = require('./registerMainchain');

const getBlockchainAppsTable = () => getTableInstance(blockchainAppsTableSchema, MYSQL_ENDPOINT);
const getCCUTable = () => getTableInstance(ccuTableSchema, MYSQL_ENDPOINT);
const getTransactionsTable = () => getTableInstance(transactionsTableSchema, MYSQL_ENDPOINT);

// Command specific constants
const COMMAND_NAME = 'submitSidechainCrossChainUpdate';

const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	if (tx.executionStatus !== TRANSACTION_STATUS.SUCCESS) return;

	const blockchainAppsTable = await getBlockchainAppsTable();
	const ccuTable = await getCCUTable();

	const chainInfo = await getChainInfo(tx.params.sendingChainID);

	logger.trace(`Indexing cross chain update transaction ${tx.id} contained in block at height ${tx.height}.`);

	const appInfo = {
		chainID: tx.params.sendingChainID,
		status: chainInfo.status,
		lastUpdated: blockHeader.timestamp,
		lastCertificateHeight: blockHeader.height,
	};

	await blockchainAppsTable.upsert(appInfo, dbTrx);
	await ccuTable.upsert({
		height: tx.height,
		sendingChainID: tx.params.sendingChainID,
		transactionID: tx.id,
	}, dbTrx);

	logger.debug(`Indexed cross chain update transaction ${tx.id} contained in block at height ${tx.height}.`);
};

const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	if (tx.executionStatus !== TRANSACTION_STATUS.SUCCESS) return;

	const blockchainAppsTable = await getBlockchainAppsTable();
	const transactionsTable = await getTransactionsTable();
	const ccuTable = await getCCUTable();

	logger.trace(`Reverting cross chain update transaction ${tx.id} contained in block at height ${tx.height}.`);

	const searchParams = {
		sendingChainID: tx.params.sendingChainID,
		propBetweens: [{
			property: 'height',
			lowerThan: blockHeader.height,
		}],
		sort: 'height:desc',
		limit: 1,
	};

	const [{ height: prevTransactionHeight }] = await ccuTable.find(searchParams, 'height');
	const [prevTransaction] = await transactionsTable.find(
		{
			height: prevTransactionHeight,
			moduleCommand: tx.moduleCommand,
			limit: 1,
		}, 'timestamp');

	const chainInfo = await getChainInfo(tx.params.sendingChainID);
	const appInfo = {
		chainID: tx.params.sendingChainID,
		status: chainInfo.status,
		lastUpdated: prevTransaction.timestamp,
		lastCertificateHeight: prevTransactionHeight,
	};

	await blockchainAppsTable.upsert(appInfo, dbTrx);
	logger.debug(`Reverted cross chain update transaction ${tx.id} contained in block at height ${tx.height}.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};
