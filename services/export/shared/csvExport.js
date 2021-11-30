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
const Moment = require('moment');
const MomentRange = require('moment-range');

const moment = MomentRange.extendMoment(Moment);

const {
	CacheRedis,
	Exceptions: {
		NotFoundException,
		ValidationException,
	},
} = require('lisk-service-framework');

const {
	requestRpc,
} = require('./rpcBroker');

const Queue = require('./queue');

const {
	getBase32AddressFromPublicKey,
} = require('./helpers/account');

const {
	parseJsonToCsv,
} = require('./helpers/csv');

const {
	getDaysInMilliseconds,
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
const FilesystemCache = require('./csvCache');

const partials = FilesystemCache(config.cache.partials);
const staticFiles = FilesystemCache(config.cache.exports);

const noTransactionsCache = CacheRedis('noTransactions', config.endpoints.volatileRedis);

const DATE_FORMAT = config.csv.dateFormat;
const MAX_NUM_TRANSACTIONS = 10000;

const getAccounts = async (params) => requestRpc('core.accounts', params);

const getTransactions = async (params) => requestRpc('core.transactions', params);

const isBlockchainIndexReady = async () => requestRpc('gateway.isBlockchainIndexReady', {});

const getFirstBlock = async () => requestRpc(
	'core.blocks',
	{
		limit: 1,
		sort: 'height:asc',
	},
);

const getAddressFromParams = (params) => params.address
	|| getBase32AddressFromPublicKey(params.publicKey);

const getTransactionsInAsc = async (params) => getTransactions({
	senderIdOrRecipientId: getAddressFromParams(params),
	sort: 'timestamp:asc',
	timestamp: params.timestamp,
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

const getDefaultStartDate = async () => {
	const { data: [block] } = await getFirstBlock();
	return moment(block.timestamp * 1000).format(DATE_FORMAT);
};

const getToday = () => moment().format(DATE_FORMAT);

const standardizeIntervalFromParams = async ({ interval }) => {
	let from;
	let to;
	if (interval && interval.includes(':')) {
		[from, to] = interval.split(':');
		if ((moment(to, DATE_FORMAT).diff(moment(from, DATE_FORMAT))) < 0) {
			throw new ValidationException(`Invalid interval supplied: ${interval}`);
		}
	} else if (interval) {
		from = interval;
		to = getToday();
	} else {
		from = await getDefaultStartDate();
		to = getToday();
	}
	return `${from}:${to}`;
};

const getPartialFilenameFromParams = async (params, day) => {
	const address = getAddressFromParams(params);
	const filename = `${address}_${day}.json`;
	return filename;
};

const getCsvFilenameFromParams = async (params) => {
	const address = getAddressFromParams(params);
	const [from, to] = (await standardizeIntervalFromParams(params)).split(':');

	const filename = `transactions_${address}_${from}_${to}.csv`;
	return filename;
};

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

const parseTransactionsToCsv = (json) => {
	const opts = { delimiter: config.csv.delimiter, fields };
	return parseJsonToCsv(opts, json);
};

const transactionsToCSV = (transactions, address) => {
	// Add duplicate entry with zero fees for self token transfer transactions
	transactions.forEach((tx, i, arr) => {
		if (checkIfSelfTokenTransfer(tx) && !tx.isSelfTokenTransferCredit) {
			arr.splice(i + 1, 0, { ...tx, fee: '0', isSelfTokenTransferCredit: true });
		}
	});

	return parseTransactionsToCsv(transactions.map(t => normalizeTransaction(address, t)));
};

const exportTransactionsCSV = async (job) => {
	const { params } = job.data;

	const allTransactions = [];

	const interval = await standardizeIntervalFromParams(params);
	const [from, to] = interval.split(':');
	const range = moment.range(moment(from, DATE_FORMAT), moment(to, DATE_FORMAT));
	const arrayOfDates = (Array.from(range.by('day'))).map(d => d.format(DATE_FORMAT));

	for (let i = 0; i < arrayOfDates.length; i++) {
		/* eslint-disable no-await-in-loop */
		const day = arrayOfDates[i];
		const partialFilename = await getPartialFilenameFromParams(params, day);
		if (await partials.exists(partialFilename)) {
			const transactions = JSON.parse(await partials.read(partialFilename));
			allTransactions.push(...transactions);
		} else if (await noTransactionsCache.get(partialFilename) !== true) {
			const fromTimestampPast = moment(day, DATE_FORMAT).startOf('day').unix();
			const toTimestampPast = moment(day, DATE_FORMAT).endOf('day').unix();
			const transactions = await requestAll(
				getTransactionsInAsc,
				{
					...params,
					timestamp: `${fromTimestampPast}:${toTimestampPast}`,
				},
				MAX_NUM_TRANSACTIONS,
			);
			allTransactions.push(...transactions);

			if (day !== getToday()) {
				if (transactions.length) {
					partials.write(partialFilename, JSON.stringify(transactions));
				} else {
					// Flag to prevent unnecessary calls to core/storage space usage on the file cache
					const RETENTION_PERIOD = getDaysInMilliseconds(config.cache.partials.retentionInDays);
					await noTransactionsCache.set(partialFilename, true, RETENTION_PERIOD);
				}
			}
		}
		/* eslint-enable no-await-in-loop */
	}

	const csvFilename = await getCsvFilenameFromParams(params);
	const csv = transactionsToCSV(allTransactions, getAddressFromParams(params));
	await staticFiles.write(csvFilename, csv);
};

const scheduleTransactionExportQueue = Queue('scheduleTransactionExportQueue', exportTransactionsCSV, 50);

const scheduleTransactionHistoryExport = async (params) => {
	// Schedule only when index is completely built
	if (!await isBlockchainIndexReady()) throw new ValidationException('Blockchain index is not yet ready.');

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

	const csvFilename = await getCsvFilenameFromParams(params);
	if (await staticFiles.exists(csvFilename)) {
		exportResponse.data.fileName = csvFilename;
		exportResponse.data.fileUrl = await getCsvFileUrlFromParams(params);
		exportResponse.meta.ready = true;
	} else {
		await scheduleTransactionExportQueue.add({ params });
		exportResponse.status = 'ACCEPTED';
	}

	return exportResponse;
};

const downloadTransactionHistory = async ({ filename }) => {
	const csvResponse = {
		data: {},
		meta: {},
	};

	const isFileExists = await staticFiles.exists(filename);
	if (!isFileExists) throw new NotFoundException(`File ${filename} not found.`);

	csvResponse.data = await staticFiles.read(filename);
	csvResponse.meta.filename = filename;

	// Remove the static file if end date is current date
	// TODO: Implement a better solution
	const regex = /_|\./g;
	const splits = filename.split(regex);
	const endDate = splits[splits.length - 2];
	if (endDate === getToday()) staticFiles.remove(filename);

	return csvResponse;
};

module.exports = {
	exportTransactionsCSV,
	scheduleTransactionHistoryExport,
	downloadTransactionHistory,

	// For functional tests
	getAddressFromParams,
	getToday,
	normalizeTransaction,
	parseTransactionsToCsv,
	transactionsToCSV,

	standardizeIntervalFromParams,
	getPartialFilenameFromParams,
	getCsvFilenameFromParams,
	getCsvFileUrlFromParams,
};
