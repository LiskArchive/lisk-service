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
const {
	getIndexedAccountInfo,
	getLisk32AddressFromPublicKey,
	updateAccountPublicKey,
} = require('../../utils/accountUtils');
const { requestConnector } = require('../../utils/request');

let pendingTransactionsList = [];

const getPendingTransactionsFromCore = async () => {
	const response = await requestConnector('getTransactionsFromPool');
	const pendingTx = await BluebirdPromise.map(
		response,
		async transaction => {
			const normalizedTransaction = await normalizeTransaction(transaction);
			const senderAddress = getLisk32AddressFromPublicKey(normalizedTransaction.senderPublicKey);
			const account = await getIndexedAccountInfo({ address: senderAddress }, ['name']);

			normalizedTransaction.sender = {
				address: senderAddress,
				publicKey: normalizedTransaction.senderPublicKey,
				name: account.name || null,
			};

			if (normalizedTransaction.params.recipientAddress) {
				const recipientAccount = await getIndexedAccountInfo(
					{ address: normalizedTransaction.params.recipientAddress },
					['publicKey', 'name'],
				);

				normalizedTransaction.meta = {
					recipient: {
						address: normalizedTransaction.params.recipientAddress,
						publicKey: recipientAccount ? recipientAccount.publicKey : null,
						name: recipientAccount ? recipientAccount.name : null,
					},
				};
			}

			updateAccountPublicKey(normalizedTransaction.senderPublicKey);
			normalizedTransaction.executionStatus = 'pending';
			return normalizedTransaction;
		},
		{ concurrency: response.length },
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
	if (params.address) {
		validatedParams.senderAddress = params.address;
		validatedParams.recipientAddress = params.address;
	}
	if (params.senderAddress) validatedParams.senderAddress = params.senderAddress;
	if (params.recipientAddress) validatedParams.recipientAddress = params.recipientAddress;
	if (params.moduleCommand) validatedParams.moduleCommand = params.moduleCommand;
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
			? Number(a[sortProp] || 0) - Number(b[sortProp] || 0)
			: Number(b[sortProp] || 0) - Number(a[sortProp] || 0);
		return comparator;
	};

	if (pendingTransactionsList.length) {
		// Filter according to the request params
		const filteredPendingTxs = pendingTransactionsList.filter(transaction => (
			(!params.id
				|| transaction.id === params.id)
			&& (!params.senderAddress
				|| transaction.sender.address === params.senderAddress)
			&& (!params.recipientAddress
				|| transaction.params.recipientAddress === params.recipientAddress)
			&& (!params.moduleCommand
				|| transaction.moduleCommand === params.moduleCommand)
		));

		pendingTransactions.data = filteredPendingTxs
			.sort(sortComparator(params.sort))
			.slice(offset, offset + limit)
			.map(transaction => {
				// Set the 'executionStatus'
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
