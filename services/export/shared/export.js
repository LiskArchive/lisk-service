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
const path = require('path');

const {
	Exceptions: { NotFoundException },
} = require('lisk-service-framework');

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

const fileStorage = require('./helpers/file');
const config = require('../config');
const fields = require('./csvFieldMappings');

const requestAll = require('./requestAll');
const FilesystemCache = require('./csvCache');

// const partials = FilesystemCache(config.cache.partials);
const staticFiles = FilesystemCache(config.cache.exports);

const getAccounts = async (params) => requestRpc('core.accounts', params);

const getTransactions = async (params) => requestRpc('core.transactions', params);

const getAddressFromParams = (params) => params.address
	|| getBase32AddressFromPublicKey(params.publicKey);

const getTransactionsInAsc = async (params) => getTransactions({
	senderIdOrRecipientId: getAddressFromParams(params),
	sort: 'timestamp:asc',
	limit: params.limit || 10,
	offset: params.offset || 0,
});

const validateIfAccountExists = async (params) => {
	const address = getAddressFromParams(params);
	const accResponse = await getAccounts({ address }).catch(_ => _);
	return (accResponse.data && accResponse.data.length);
};

const validateIfAccountHasTransactions = async (params) => {
	const response = await getTransactions({
		senderIdOrRecipientId: getAddressFromParams(params),
		limit: 1,
	});
	return !!response.data.length;
};

const parseTransactionsToCsv = (json) => {
	const opts = { delimiter: config.csv.delimiter, fields };
	return parseJsonToCsv(opts, json);
};

const standardizeIntervalFromParams = async ({ interval }) => {
	let from;
	let to;
	if (interval && interval.includes(':')) {
		[from, to] = interval.split(':');
	} else if (interval) {
		from = interval;
		to = moment().format(config.csv.dateFormat);
	} else {
		from = '2016-01-01'; // TODO: Start date of the blockchain
		to = moment().format(config.csv.dateFormat);
	}
	return `${from}:${to}`;
};

const getCsvFilenameFromParams = async (params) => {
	const address = getAddressFromParams(params);
	const [from, to] = (await standardizeIntervalFromParams(params)).split(':');

	const filename = `transactions_${address}_${from}_${to}.csv`;
	return filename;
};

// eslint-disable-next-line no-unused-vars
const getCsvFileUrlFromParams = async (params) => {
	const filename = await getCsvFilenameFromParams(params);

	// TODO: Base URL on config for filesystem or S3
	const url = `/api/v2/exports/${filename}`;
	return url;
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

	const address = getAddressFromParams(params);

	// Validate if account exists
	const isAccountExists = await validateIfAccountExists(params);
	if (!isAccountExists) throw new NotFoundException(`Account ${address} not found.`);

	// Validate if account has transactions
	const isAccountHasTransactions = await validateIfAccountHasTransactions({ address });
	if (!isAccountHasTransactions) throw new NotFoundException(`Account ${address} has no transactions.`);

	let csv;
	const MAX_NUM_TRANSACTIONS = 10000;
	const file = await getCsvFilenameFromParams(params);

	if (await staticFiles.exists(file)) csv = await staticFiles.read(file);
	else {
		const transactions = await requestAll(getTransactionsInAsc, params, MAX_NUM_TRANSACTIONS);

		// Sort transactions in ascending by their timestamp
		// Redundant, remove it???
		transactions.sort((t1, t2) => t1.unixTimestamp - t2.unixTimestamp);

		// Add duplicate entry with zero fees for self token transfer transactions
		transactions.forEach((tx, i, arr) => {
			if (checkIfSelfTokenTransfer(tx) && !tx.isSelfTokenTransferCredit) {
				arr.splice(i + 1, 0, { ...tx, fee: '0', isSelfTokenTransferCredit: true });
			}
		});

		csv = parseTransactionsToCsv(transactions.map(t => normalizeTransaction(address, t)));
		staticFiles.write(file, csv);
	}

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

	const { publicKey } = params;
	const address = getAddressFromParams(params);

	// Validate if account exists
	const isAccountExists = await validateIfAccountExists(params);
	if (!isAccountExists) throw new NotFoundException(`Account ${address} not found.`);

	// Validate if account has transactions
	const isAccountHasTransactions = await validateIfAccountHasTransactions({ address });
	if (!isAccountHasTransactions) throw new NotFoundException(`Account ${address} has no transactions.`);

	exportResponse.data.address = address;
	exportResponse.data.publicKey = publicKey;
	exportResponse.data.interval = await standardizeIntervalFromParams(params);

	const fileName = await getCsvFilenameFromParams(params);
	if (await staticFiles.exists(fileName)) {
		exportResponse.data.fileName = fileName;
		exportResponse.data.fileUrl = await getCsvFileUrlFromParams(params);
		exportResponse.meta.ready = true;
	} else {
		// TODO: Add scheduling logic
		exportTransactionsCSV(params);
		exportResponse.status = 'ACCEPTED';
	}

	return exportResponse;
};

const downloadTransactionHistory = async (params) => {
	const csv = {
		data: {},
		meta: {
			filename: '',
		},
	};
	const dirPath = path.join(config.cache.exports.dirPath);
	const staticFilePath = `${dirPath}/${params.filename}`;

	if (!await fileStorage.exists(staticFilePath)) throw new NotFoundException(`File ${params.filename} not found.`);
	csv.data = await fileStorage.read(staticFilePath);
	csv.meta.filename = params.filename;
	return csv;
};

module.exports = {
	exportTransactionsCSV,
	scheduleTransactionHistoryExport,
	downloadTransactionHistory,
};
