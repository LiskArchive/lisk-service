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
const { indexAccountAddress } = require('../../accountIndex');
const { requestConnector } = require('../../../utils/request');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;

const transactionsTableSchema = require('../../../database/schema/transactions');

const getTransactionsTable = () => getTableInstance(transactionsTableSchema, MYSQL_ENDPOINT);

// Command specific constants
const COMMAND_NAME = 'transfer';

const EVENT_NAME_INITIALIZE_USER_ACCOUNT = 'initializeUserAccount';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	logger.trace(`Updating index for the account with address ${tx.params.recipientAddress} asynchronously.`);
	indexAccountAddress(tx.params.recipientAddress);

	if (tx.executionStatus !== TRANSACTION_STATUS.SUCCESS) return;

	tx = {
		...tx,
		...tx.params,
	};

	const filterInitializeUserAccountEvent = events
		.find(event => event.name === EVENT_NAME_INITIALIZE_USER_ACCOUNT
			&& event.data.address === tx.params.recipientAddress);

	if (filterInitializeUserAccountEvent) {
		const formattedTransaction = await requestConnector('formatTransaction', {
			transaction: tx,
			additionalFee: filterInitializeUserAccountEvent.data.initializationFee,
		});

		tx.minFee = formattedTransaction ? formattedTransaction.minFee : tx.minFee;
	}

	const transactionsTable = await getTransactionsTable();
	logger.trace(`Indexing transaction ${tx.id} contained in block at height ${tx.height}.`);
	await transactionsTable.upsert(tx, dbTrx);
	logger.debug(`Indexed transaction ${tx.id} contained in block at height ${tx.height}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	logger.trace(`Updating index for the account with address ${tx.params.recipientAddress} asynchronously.`);
	indexAccountAddress(tx.params.recipientAddress);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};
