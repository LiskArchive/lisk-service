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
	Exceptions: { InvalidParamsException },
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const { getBlockByID } = require('./blocks');

const {
	getLisk32AddressFromPublicKey,
	getIndexedAccountInfo,
} = require('../../utils/accountUtils');
const { requestConnector } = require('../../utils/request');
const { normalizeRangeParam } = require('../../utils/paramUtils');
const { normalizeTransaction } = require('../../utils/transactionsUtils');
const { getFinalizedHeight } = require('../../constants');

const transactionsIndexSchema = require('../../database/schema/transactions');
const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getTransactionsIndex = () => getTableInstance('transactions', transactionsIndexSchema, MYSQL_ENDPOINT);

const getTransactionIDsByBlockID = async blockID => {
	const transactionsTable = await getTransactionsIndex();
	const transactions = await transactionsTable.find({
		whereIn: {
			property: 'blockId',
			values: [blockID],
		},
	}, ['id']);
	const transactionsIds = transactions.map(t => t.id);
	return transactionsIds;
};

const normalizeTransactions = async txs => {
	const normalizedTransactions = await BluebirdPromise.map(
		txs,
		async tx => normalizeTransaction(tx),
		{ concurrency: txs.length },
	);
	return normalizedTransactions;
};

const getTransactionByID = async id => {
	const response = await requestConnector('getTransactionByID', { id });
	return normalizeTransaction(response);
};

const getTransactionsByIDs = async ids => {
	const response = await requestConnector('getTransactionsByIDs', { ids });
	return normalizeTransactions(response);
};

const validateParams = async params => {
	if (params.height && typeof params.height === 'string' && params.height.includes(':')) {
		params = normalizeRangeParam(params, 'height');
	}

	if (params.timestamp && params.timestamp.includes(':')) {
		params = normalizeRangeParam(params, 'timestamp');
	}

	if (params.nonce && !(params.senderAddress)) {
		throw new InvalidParamsException('Nonce based retrieval is only possible along with senderAddress');
	}

	if (params.executionStatus) {
		const { executionStatus, ...remParams } = params;
		params = remParams;
		const executionStatuses = executionStatus.split(',').map(e => e.trim()).filter(e => e !== 'any');
		params.whereIn = { property: 'executionStatus', values: executionStatuses };
	}

	if (params.address) {
		const { address, ...remParams } = params;
		params = remParams;

		params.orWhere = { recipientAddress: address };
		params.orWhereWith = { senderAddress: address };
	}

	return params;
};

const getTransactions = async params => {
	const transactionsTable = await getTransactionsIndex();
	const transactions = {
		data: [],
		meta: {},
	};

	params = await validateParams(params);

	const total = await transactionsTable.count(params);
	const resultSet = await transactionsTable.find(
		{ ...params, limit: params.limit || total },
		['id', 'timestamp', 'height', 'blockID', 'executionStatus'],
	);
	params.ids = resultSet.map(row => row.id);

	if (params.ids.length) {
		const BATCH_SIZE = 25;
		for (let i = 0; i < Math.ceil(params.ids.length / BATCH_SIZE); i++) {
			transactions.data = transactions.data.concat(
				// eslint-disable-next-line no-await-in-loop
				await getTransactionsByIDs(params.ids.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)),
			);
		}
	} else if (params.id) {
		transactions.data.push(await getTransactionByID(params.id));
		if ('offset' in params && params.limit) {
			transactions.data = transactions.data.slice(params.offset, params.offset + params.limit);
		}
	}

	transactions.data = await BluebirdPromise.map(
		transactions.data,
		async transaction => {
			const senderAddress = getLisk32AddressFromPublicKey(transaction.senderPublicKey);
			const senderAccount = await getIndexedAccountInfo(
				{ address: senderAddress, limit: 1 },
				['name'],
			);

			transaction.sender = {
				address: senderAddress,
				publicKey: transaction.senderPublicKey,
				name: senderAccount ? senderAccount.name : null,
			};

			if (transaction.params.recipientAddress) {
				const recipientAccount = await getIndexedAccountInfo(
					{ address: transaction.params.recipientAddress, limit: 1 },
					['publicKey', 'name'],
				);

				transaction.meta = {
					recipient: {
						address: transaction.params.recipientAddress,
						publicKey: recipientAccount ? recipientAccount.publicKey : null,
						name: recipientAccount ? recipientAccount.name : null,
					},
				};
			}

			const indexedTxInfo = resultSet.find(txInfo => txInfo.id === transaction.id) || {};
			transaction.block = {
				id: indexedTxInfo.blockID,
				height: indexedTxInfo.height,
				timestamp: indexedTxInfo.timestamp,
				isFinal: indexedTxInfo.height <= (await getFinalizedHeight()),
			};

			transaction.executionStatus = indexedTxInfo.executionStatus;

			return transaction;
		},
		{ concurrency: transactions.data.length },
	);

	transactions.meta.total = total;
	transactions.meta.count = transactions.data.length;
	transactions.meta.offset = params.offset;

	return transactions;
};

const getTransactionsByBlockID = async blockID => {
	const block = await getBlockByID(blockID);
	const transactions = await BluebirdPromise.map(
		block.transactions,
		async (transaction) => {
			const senderAddress = getLisk32AddressFromPublicKey(transaction.senderPublicKey);

			const senderAccount = await getIndexedAccountInfo(
				{ address: senderAddress, limit: 1 },
				['name'],
			);

			transaction.sender = {
				address: senderAddress,
				publicKey: transaction.senderPublicKey,
				name: senderAccount ? senderAccount.name : null,
			};

			if (transaction.params.recipientAddress) {
				const recipientAccount = await getIndexedAccountInfo(
					{ address: transaction.params.recipientAddress, limit: 1 },
					['publicKey', 'name'],
				);

				transaction.meta = {
					recipient: {
						address: transaction.params.recipientAddress,
						publicKey: recipientAccount ? recipientAccount.publicKey : null,
						name: recipientAccount ? recipientAccount.name : null,
					},
				};
			}

			transaction.block = {
				id: block.id,
				height: block.height,
				timestamp: block.timestamp,
			};

			// TODO: Check - this information might not be available yet
			const transactionsTable = await getTransactionsIndex();
			const [indexedTxInfo = {}] = await transactionsTable.find(
				{ id: transaction.id, limit: 1 },
				['executionStatus'],
			);
			transaction.executionStatus = indexedTxInfo.executionStatus;

			return transaction;
		},
		{ concurrency: block.transactions.length },
	);

	return {
		data: transactions,
		meta: {
			offset: 0,
			count: transactions.length,
			total: transactions.length,
		},
	};
};

module.exports = {
	getTransactions,
	getTransactionIDsByBlockID,
	getTransactionsByBlockID,
	getTransactionsByIDs,
	normalizeTransaction,
};
