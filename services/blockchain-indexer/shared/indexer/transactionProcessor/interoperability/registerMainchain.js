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
const transactionsIndexSchema = require('../../../database/schema/transactions');
const crossChainMessagesIndexSchema = require('../../../database/schema/crossChainMessages');
const blockchainAppsIndexSchema = require('../../../database/schema/blockchainApps');

const getTransactionsIndex = () => getTableInstance('transactions', transactionsIndexSchema, MYSQL_ENDPOINT);
const getCrossChainMessagesIndex = () => getTableInstance('ccm', crossChainMessagesIndexSchema, MYSQL_ENDPOINT);
const getBlockchainAppsIndex = () => getTableInstance('blockchain_apps', blockchainAppsIndexSchema, MYSQL_ENDPOINT);

// command specific constants
const commandID = 1;
const commandName = 'mainchainRegistration';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, dbTrx) => {
	const transactionsDB = await getTransactionsIndex();
	const crossChainMessagesDB = await getCrossChainMessagesIndex();
	const blockchainAppsDB = await getBlockchainAppsIndex();

	logger.trace(`Indexing cross chain register transaction ${tx.id} contained in block at height ${tx.height}`);

	tx.moduleCrossChainCommandID = tx.moduleID.concat(tx.crossChainCommandID);
	await crossChainMessagesDB.upsert(tx, dbTrx);

	const appInfo = {
		name: tx.params.ownName,
		chainID: tx.params.ownChainID,
		address: '', // TODO: Verify and update address
		isDefault: config.defaultApps.some(e => e === tx.params.ownName),
		state: tx.status,
	};
	await blockchainAppsDB.upsert(appInfo, dbTrx);

	await transactionsDB.upsert(tx, dbTrx);
	logger.debug(`Indexed cross chain register transaction ${tx.id} contained in block at height ${tx.height}`);
};

module.exports = {
	commandID,
	commandName,
	applyTransaction,
};
