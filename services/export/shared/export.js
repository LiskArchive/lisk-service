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
const moment = require('moment');

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

const FilesystemCache = require('./csvCache');

const {
	normalizeTransactionAmount,
	normalizeTransactionFee,
	checkIfSelfTokenTransfer,
} = require('./helpers/transaction');

const config = require('../config');
const fields = require('./csvFieldMappings');

const requestAll = require('./requestAll');

// const partials = FilesystemCache(config.cache.partials);
const staticFiles = FilesystemCache(config.cache.exports);

const getAllTransactions = async (params) => requestRpc(
	'core.transactions',
	{
		senderIdOrRecipientId: params.address,
		sort: 'timestamp:asc',
		timestamp: params.timestamp,
	},
);

const parseTransactionsToCsv = (json) => {
	const opts = { delimiter: config.csv.delimiter, fields };
	return parseJsonToCsv(opts, json);
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

const getDefaultStartDate = async () => '2016-01-01';

const getToday = () => moment().format('YYYY-MM-DD');
// const getYesterday = () => moment().subtract(1, 'days').format('YYYY-MM-DD');

const MAX_NUM_TRANSACTIONS = 10000;

const getTransactions = (queryParams) => requestAll(getAllTransactions,
	queryParams, MAX_NUM_TRANSACTIONS);

const transactionsToCSV = (transactions, address) => {
	// Add duplicate entry with zero fees for self token transfer transactions
	transactions.forEach((tx, i, arr) => {
		if (checkIfSelfTokenTransfer(tx) && !tx.isSelfTokenTransferCredit) {
			arr.splice(i + 1, 0, { ...tx, fee: '0', isSelfTokenTransferCredit: true });
		}
	});

	return parseTransactionsToCsv(transactions.map(t => normalizeTransaction(address, t)));
};

const exportTransactionsCSV = async (params) => {
	const address = params.address || getBase32AddressFromPublicKey(params.publicKey);
	let { from, to } = params;

	if (!from) from = await getDefaultStartDate();
	if (!to) to = getToday();

	let csv;
	const file = `${address}_${from}_${to}.csv`;

	if (await staticFiles.exists(file)) csv = await staticFiles.read(file);
	else {
		const transactions = await getTransactions({
			address,
			timestamp: `${moment(from).unix()}:${moment(to).unix()}`,
		});

		csv = transactionsToCSV(transactions, address);

		staticFiles.write(file, csv);
	}

	return csv;
};

module.exports = {
	exportTransactionsCSV,
};
