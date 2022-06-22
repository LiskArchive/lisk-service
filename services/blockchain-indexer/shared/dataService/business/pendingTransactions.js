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
const BluebirdPromise = require('bluebird');
const {
	Logger,
	Exceptions: { ValidationException },
} = require('lisk-service-framework');

const logger = Logger();

const { normalizeTransaction } = require('./transactions');
const { getIndexedAccountInfo } = require('../../utils/accountUtils');
const { requestConnector } = require('../../utils/request');

let pendingTransactionsList = [];

const getPendingTransactionsFromCore = async () => {
	const response = await requestConnector('getTransactionsFromPool');
	let pendingTx = await normalizeTransaction(response);
	pendingTx = await BluebirdPromise.map(
		pendingTx,
		async transaction => {
			const account = await getIndexedAccountInfo({
				publicKey: transaction.senderPublicKey,
				limit: 1,
			}, ['address', 'username']);
			transaction.senderId = account && account.address ? account.address : undefined;
			transaction.username = account && account.username ? account.username : undefined;
			transaction.isPending = true;
			return transaction;
		},
		{ concurrency: pendingTx.length },
	);
	return pendingTx;
};

const loadAllPendingTransactions = async () => {
	try {
		pendingTransactionsList = await getPendingTransactionsFromCore();
		logger.info(`Updated pending transaction cache with ${pendingTransactionsList.length} transactions.`);
	} catch (err) {
		logger.error(`Failed to update the 'pendingTransactionsList' due to:\n${err.stack}`);
	}
};

const validateParams = async params => {
	const validatedParams = {};
	if (params.nonce && !(params.senderAddress)) {
		throw new ValidationException('Nonce based retrieval is only possible along with senderAddress');
	}

	if (params.id) validatedParams.id = params.id;
	if (params.senderAddress) validatedParams.senderAddress = params.senderAddress;
	if (params.moduleCommandID) validatedParams.moduleCommandID = params.moduleCommandID;
	if (params.moduleCommandName) validatedParams.moduleCommandName = params.moduleCommandName;
	if (params.sort) validatedParams.sort = params.sort;

	return validatedParams;
};

const getPendingTransactions = async params => {
	const pendingTransactions = {
		data: [],
		meta: { total: 0 },
	};

	const offset = Number(params.offset) || 0;
	const limit = Number(params.limit) || 10;

	params = await validateParams(params);

	const sortComparator = (sortParam) => {
		const sortProp = sortParam.split(':')[0];
		const sortOrder = sortParam.split(':')[1];

		const comparator = (a, b) => (sortOrder === 'asc')
			? Number(a[sortProp]) - Number(b[sortProp])
			: Number(b[sortProp]) - Number(a[sortProp]);
		return comparator;
	};

	if (pendingTransactionsList.length) {
		// Filter according to the request params
		const filteredPendingTxs = pendingTransactionsList.filter(transaction => (
			(!params.id
				|| transaction.id === params.id)
			&& (!params.senderAddress
				|| transaction.senderAddress === params.senderAddress)
			&& (!params.moduleCommandID
				|| transaction.moduleCommandID === params.moduleCommandID)
			&& (!params.moduleCommandName
				|| transaction.moduleCommandName === params.moduleCommandName)
		));

		pendingTransactions.data = filteredPendingTxs
			.sort(sortComparator(params.sort))
			.slice(offset, offset + limit)
			.forEach(transaction => {
				// Assign 'executionStatus'
				transaction.executionStatus = 'pending';
				return transaction;
			});

		pendingTransactions.meta = {
			count: pendingTransactions.data.length,
			offset,
			total: filteredPendingTxs.length,
		};
	}
	return pendingTransactions;
};

module.exports = {
	getPendingTransactions,
	loadAllPendingTransactions,
};
