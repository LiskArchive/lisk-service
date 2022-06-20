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

const getTransactionsIndex = () => getTableInstance('transactions', transactionsIndexSchema, MYSQL_ENDPOINT);

// Asset specific constants
const assetID = 0;
const assetName = 'transfer';

// eslint-disable-next-line no-unused-vars
const processTransaction = async (blockHeader, tx, dbTrx) => {
	const transactionsDB = await getTransactionsIndex();

	tx.amount = tx.params.amount;
	tx.data = tx.params.data;
	tx.recipientAddress = tx.params.recipientAddress;

	logger.trace(`Indexing transaction ${tx.id} contained in block at height ${tx.height}`);
	await transactionsDB.upsert(tx, dbTrx);
	logger.debug(`Indexed transaction ${tx.id} contained in block at height ${tx.height}`);
};

module.exports = {
	assetID,
	assetName,
	processTransaction,
};
