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
const { decodeTransaction } = require('./decoder');
const { encodeTransaction } = require('./encoder');
const {
	getTransactionByID,
	getTransactionsByIDs,
	getTransactionsFromPool,
	postTransaction,
	dryRunTransaction,
} = require('./endpoints');

const getTransactionByIDDecoded = async (id) => {
	const transaction = await getTransactionByID(id);
	const decodedTransaction = decodeTransaction(transaction);
	return decodedTransaction;
};

const getTransactionsByIDsDecoded = async (ids) => {
	const transactions = await getTransactionsByIDs(ids);
	const decodedTransactions = transactions.map((t) => decodeTransaction(t));
	return decodedTransactions;
};

const getTransactionsFromPoolDecoded = async () => {
	const transactions = await getTransactionsFromPool();
	const decodedTransactions = transactions.map((t) => decodeTransaction(t));
	return decodedTransactions;
};

const dryRunTransactionWrapper = async (params) => {
	const { transaction, isSkipVerify } = params;

	const encodedTransaction = encodeTransaction(transaction);

	return dryRunTransaction({ transaction: encodedTransaction, skipVerify: isSkipVerify });
};

module.exports = {
	getTransactionByID: getTransactionByIDDecoded,
	getTransactionsByIDs: getTransactionsByIDsDecoded,
	getTransactionsFromPool: getTransactionsFromPoolDecoded,
	postTransaction,
	dryRunTransaction: dryRunTransactionWrapper,
};
