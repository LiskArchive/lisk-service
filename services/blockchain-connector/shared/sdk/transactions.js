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
const { formatTransaction } = require('./formatter');
const { encodeTransaction } = require('./encoder');
const {
	getTransactionByID,
	getTransactionsByIDs,
	getTransactionsFromPool,
	postTransaction,
	dryRunTransaction,
} = require('./endpoints');

const getTransactionByIDFormatted = async (id) => {
	const transaction = await getTransactionByID(id);
	const formattedTransaction = formatTransaction(transaction);
	return formattedTransaction;
};

const getTransactionsByIDsFormatted = async (ids) => {
	const transactions = await getTransactionsByIDs(ids);
	const formattedTransactions = transactions.map((t) => formatTransaction(t));
	return formattedTransactions;
};

const getTransactionsFromPoolFormatted = async () => {
	const transactions = await getTransactionsFromPool();
	const formattedTransactions = transactions.map((t) => formatTransaction(t));
	return formattedTransactions;
};

const dryRunTransactionWrapper = async (params) => {
	const { transaction, skipVerify } = params;
	const encodedTransaction = typeof transaction === 'object'
		? encodeTransaction(transaction)
		: transaction;

	return dryRunTransaction({ transaction: encodedTransaction, skipVerify });
};

module.exports = {
	getTransactionByID: getTransactionByIDFormatted,
	getTransactionsByIDs: getTransactionsByIDsFormatted,
	getTransactionsFromPool: getTransactionsFromPoolFormatted,
	postTransaction,
	dryRunTransaction: dryRunTransactionWrapper,
};
