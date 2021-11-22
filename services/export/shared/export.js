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
const {
	requestRpc,
} = require('./rpcBroker');

const {
	getBase32AddressFromPublicKey,
} = require('./helpers/account');

const {
	parseJsonToCsv,
} = require('./helpers/csv');

const {
	dateFromTimestamp,
	timeFromTimestamp,
} = require('./helpers/time');

const {
	normalizeTransactionAmount,
	normalizeTransactionFee,
	checkIfSelfTokenTransfer,
} = require('./helpers/transaction');

const config = require('../config');
const fields = require('./csvFieldMappings');

const requestAll = require('./requestAll');

const getAllTransactions = async (params) => requestRpc(
	'core.transactions',
	{
		senderIdOrRecipientId: params.address,
		sort: 'timestamp:asc',
	},
);

const parseTransactionsToCsv = (json) => {
	const opts = { delimiter: config.csv.delimiter, fields };
	return parseJsonToCsv(opts, json);
};

const getCsvFilenameFromParams = async (params) => {
	const { interval } = params;

	const address = params.address || getBase32AddressFromPublicKey(params.publicKey);

	let filename = `transactions_${address}`;
	if (interval) {
		if (interval.includes(':')) {
			const [from, to] = interval.split(':');
			filename = `${filename}_${from}_${to}`;
		} else {
			filename = `${filename}_${interval}`;
		}
	}

	return filename.concat('.csv');
};

const normalizeTransaction = (address, tx) => {
	const {
		moduleAssetId,
		moduleAssetName,
		senderPublicKey,
	} = tx;

	const date = dateFromTimestamp(tx.unixTimestamp);
	const time = timeFromTimestamp(tx.unixTimestamp);
	const amountLsk = normalizeTransactionAmount(address, tx);
	const feeLsk = normalizeTransactionFee(address, tx);
	const sender = tx.senderId;
	const recipient = tx.asset.recipient && tx.asset.recipient.address || null;
	const recipientPublicKey = tx.asset.recipient && tx.asset.recipient.publicKey || null;
	const blockHeight = tx.height;
	const note = tx.asset.data || null;
	const transactionId = tx.id;

	return {
		date,
		time,
		amountLsk,
		feeLsk,
		moduleAssetId,
		moduleAssetName,
		sender,
		recipient,
		senderPublicKey,
		recipientPublicKey,
		blockHeight,
		note,
		transactionId,
	};
};

const exportTransactionsCSV = async (params) => {
	const exportCsvResponse = {
		data: {},
		meta: {
			filename: '',
		},
	};

	const MAX_NUM_TRANSACTIONS = 10000;
	const transactions = await requestAll(getAllTransactions, params, MAX_NUM_TRANSACTIONS);

	// Sort transactions in ascending by their timestamp
	// Redundant, remove it???
	transactions.sort((t1, t2) => t1.unixTimestamp - t2.unixTimestamp);

	// Add duplicate entry with zero fees for self token transfer transactions
	transactions.forEach((tx, i, arr) => {
		if (checkIfSelfTokenTransfer(tx) && !tx.isSelfTokenTransferCredit) {
			arr.splice(i + 1, 0, { ...tx, fee: '0', isSelfTokenTransferCredit: true });
		}
	});

	const address = params.address || getBase32AddressFromPublicKey(params.publicKey);
	const csv = parseTransactionsToCsv(transactions.map(t => normalizeTransaction(address, t)));

	// Set the response object
	exportCsvResponse.data = csv;
	exportCsvResponse.meta.filename = await getCsvFilenameFromParams(params);

	return exportCsvResponse;
};

const scheduleTransactionHistoryExport = async (params) => {
	const exportResponse = {
		data: {},
		meta: {
			ready: false,
		},
	};

	const { publicKey, interval } = params;
	const address = params.address || getBase32AddressFromPublicKey(publicKey);

	exportResponse.data = {
		address,
		publicKey,
		interval,
	};

	// TODO: Check if request already processed (file available in cache)
	// return the file details
	// set exportResponse.meta.ready = true;

	// TODO: Add scheduling logic

	if (!exportResponse.meta.ready) exportResponse.status = 'ACCEPTED';
	return exportResponse;
};

module.exports = {
	exportTransactionsCSV,
	scheduleTransactionHistoryExport,
};
