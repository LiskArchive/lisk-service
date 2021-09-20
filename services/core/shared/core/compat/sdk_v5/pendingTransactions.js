/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
	Exceptions: { ValidationException, NotFoundException },
} = require('lisk-service-framework');

const logger = Logger();

const coreApi = require('./coreApi');
const {
	getIndexedAccountInfo,
} = require('./accounts');
const { getHexAddressFromPublicKey } = require('./accountUtils');
const { normalizeTransaction } = require('./transactions');

const requestApi = coreApi.requestRetry;

let pendingTransactionsList = [];

const getPendingTransactionsFromCore = async () => {
	const response = await requestApi(coreApi.getPendingTransactions);
	let pendingTx = await normalizeTransaction(response.data);
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
		logger.info(`Initialized/Updated pending transactions cache with ${pendingTransactionsList.length} transactions.`);
	} catch (err) {
		logger.error(`Failed to update the 'pendingTransactionsList' due to:\n${err.stack}`);
	}
};

const validateParams = async params => {
	if (params.nonce && !(params.senderAddress || params.senderPublicKey)) {
		throw new ValidationException('Nonce based retrieval is only possible along with senderAddress or senderPublicKey');
	}

	if (params.senderUsername) {
		const accountInfo = await getIndexedAccountInfo({ username: params.senderUsername, limit: 1 }, ['address', 'publicKey']);
		if (!accountInfo || accountInfo.address === undefined) return new NotFoundException(`Account with username: ${params.senderUsername} does not exist`);
		params.senderPublicKey = accountInfo.publicKey;
	}

	if (params.senderIdOrRecipientId) {
		params.senderAddress = params.senderIdOrRecipientId;
		params.recipientId = params.senderIdOrRecipientId;
	}

	if (params.senderAddress) {
		const account = await getIndexedAccountInfo({ address: params.senderAddress, limit: 1 }, ['address', 'publicKey']);
		params.senderPublicKey = account.publicKey;
	}

	if (params.recipientPublicKey) {
		params.recipientId = getHexAddressFromPublicKey(params.recipientPublicKey);
	}

	if (params.recipientUsername) {
		const accountInfo = await getIndexedAccountInfo({ username: params.recipientUsername, limit: 1 }, ['address']);
		if (!accountInfo || accountInfo.address === undefined) return new NotFoundException(`Account with username: ${params.recipientUsername} does not exist`);
		params.recipientId = accountInfo.address;
	}

	if (params.amount && params.amount.includes(':')) {
		const minAmount = params.amount.split(':')[0];
		const maxAmount = params.amount.split(':')[1];
		params.minAmount = Number(minAmount);
		params.maxAmount = Number(maxAmount);
	}
	return params;
};

const getPendingTransactions = async params => {
	const pendingTransactions = {
		data: [],
		meta: {},
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
		const filteredPendingTxs = pendingTransactionsList.filter(transaction => (
			(!params.id
				|| transaction.id === params.id)
			&& (!params.senderPublicKey
				|| transaction.senderPublicKey === params.senderPublicKey)
			&& (!params.recipientId
				|| transaction.asset.recipientAddress === params.recipientId)
			&& (!params.moduleAssetId
				|| transaction.moduleAssetId === params.moduleAssetId)
			&& (!params.moduleAssetName
				|| transaction.moduleAssetName === params.moduleAssetName)
			&& (!params.data
				|| transaction.asset.data.includes(params.data))
			&& (!params.data
				|| transaction.asset.data.includes(params.data))
			&& (!params.from
				|| Number(transaction.asset.amount) >= params.minAmount)
			&& (!params.to
				|| Number(transaction.asset.amount) <= params.maxAmount)
		));
		pendingTransactions.data = filteredPendingTxs
			.sort(sortComparator(params.sort))
			.slice(offset, offset + limit);

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
