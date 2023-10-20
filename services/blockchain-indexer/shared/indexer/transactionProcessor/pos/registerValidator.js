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
	DB: {
		MySQL: { getTableInstance },
	},
} = require('lisk-service-framework');

const config = require('../../../../config');

const { TRANSACTION_STATUS } = require('../../../constants');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const accountsTableSchema = require('../../../database/schema/accounts');
const transactionsTableSchema = require('../../../database/schema/transactions');
const validatorsTableSchema = require('../../../database/schema/validators');
const commissionsTableSchema = require('../../../database/schema/commissions');

const { getPosConstants } = require('../../../dataService');
const { requestConnector } = require('../../../utils/request');

const getAccountsTable = () => getTableInstance(accountsTableSchema, MYSQL_ENDPOINT);
const getTransactionsTable = () => getTableInstance(transactionsTableSchema, MYSQL_ENDPOINT);
const getValidatorsTable = () => getTableInstance(validatorsTableSchema, MYSQL_ENDPOINT);
const getCommissionsTable = () => getTableInstance(commissionsTableSchema, MYSQL_ENDPOINT);

// Command specific constants
const COMMAND_NAME = 'registerValidator';

const getCommissionIndexingInfo = async (blockHeader, tx) => {
	const posConstants = await getPosConstants();
	const { defaultCommission } = posConstants.data;

	const newCommissionEntry = {
		address: tx.senderAddress,
		commission: defaultCommission,
		height: blockHeader.height,
	};

	return newCommissionEntry;
};

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	if (tx.executionStatus !== TRANSACTION_STATUS.SUCCESSFUL) return;

	const accountsTable = await getAccountsTable();
	const transactionsTable = await getTransactionsTable();
	const validatorsTable = await getValidatorsTable();
	const commissionsTable = await getCommissionsTable();

	const account = {
		address: tx.senderAddress,
		publicKey: tx.senderPublicKey,
		name: tx.params.name,
		isValidator: true,
		blsKey: tx.params.blsKey,
		proofOfPossession: tx.params.proofOfPossession,
		generatorKey: tx.params.generatorKey,
	};

	logger.trace(`Updating account index for the account with address ${account.address}.`);
	await accountsTable.upsert(account, dbTrx);
	logger.debug(`Updated account index for the account with address ${account.address}.`);

	logger.trace(`Indexing validator with address ${account.address}.`);
	await validatorsTable.upsert(account, dbTrx);
	logger.debug(`Indexed validator with address ${account.address}.`);

	const posConstants = await getPosConstants();
	const formattedTransaction = await requestConnector('formatTransaction', {
		transaction: tx,
		additionalFee: posConstants.data.validatorRegistrationFee,
	});

	tx.minFee = formattedTransaction.minFee;
	logger.trace(`Indexing transaction ${tx.id} contained in block at height ${tx.height}.`);
	await transactionsTable.upsert(tx, dbTrx);
	logger.debug(`Indexed transaction ${tx.id} contained in block at height ${tx.height}.`);

	const commissionInfo = await getCommissionIndexingInfo(blockHeader, tx);
	logger.trace(
		`Indexing commission update for address ${commissionInfo.address} at height ${commissionInfo.height}.`,
	);
	await commissionsTable.upsert(commissionInfo, dbTrx);
	logger.debug(
		`Indexed commission update for address ${commissionInfo.address} at height ${commissionInfo.height}.`,
	);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	if (tx.executionStatus !== TRANSACTION_STATUS.SUCCESSFUL) return;

	const accountsTable = await getAccountsTable();
	const validatorsTable = await getValidatorsTable();
	const commissionsTable = await getCommissionsTable();

	// Remove the validator details from the table on transaction reversal
	const account = {
		address: tx.senderAddress,
		publicKey: tx.senderPublicKey,
		name: null,
		isValidator: false,
		blsKey: null,
		proofOfPossession: null,
		generatorKey: null,
	};

	logger.trace(`Updating account index for the account with address ${account.address}.`);
	await accountsTable.upsert(account, dbTrx);
	logger.debug(`Updated account index for the account with address ${account.address}.`);

	logger.trace(`Remove validator entry for address ${account.address}.`);
	const validatorPK = account[validatorsTableSchema.primaryKey];
	await validatorsTable.deleteByPrimaryKey(validatorPK, dbTrx);
	logger.debug(`Removed validator entry for address ${account.address}.`);

	const commissionInfo = await getCommissionIndexingInfo(blockHeader, tx);
	logger.trace(
		`Deleting commission entry for address ${commissionInfo.address} at height ${commissionInfo.height}.`,
	);
	await commissionsTable.delete(commissionInfo, dbTrx);
	logger.debug(
		`Deleted commission entry for address ${commissionInfo.address} at height ${commissionInfo.height}.`,
	);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};
