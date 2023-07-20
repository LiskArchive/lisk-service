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
	Queue,
} = require('lisk-service-framework');

const {
	getLisk32AddressFromPublicKey,
} = require('./helpers/account');

const { resolveReceivingChainID } = require('./helpers/chain');

const { MODULE, COMMAND, EVENT } = require('./helpers/constants');

const {
	parseJsonToCsv,
} = require('./helpers/csv');

const {
	requestIndexer,
	requestGateway,
} = require('./helpers/request');

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
const regex = require('./regex');

const partials = FilesystemCache(config.cache.partials);
const staticFiles = FilesystemCache(config.cache.exports);

const noTransactionsCache = CacheRedis('noTransactions', config.endpoints.volatileRedis);

const DATE_FORMAT = config.csv.dateFormat;
const MAX_NUM_TRANSACTIONS = 10000;
let currentChainID;

// const getAccounts = async (params) => app.requestRpc('core.accounts', params);

const getTransactions = async (params) => requestIndexer('transactions', params);
const getNetworkStatus = async () => requestIndexer('network.status');

const isBlockchainIndexReady = async () => requestGateway('isBlockchainIndexReady');

const getFirstBlock = async () => requestIndexer(
	'blocks',
	{
		limit: 1,
		sort: 'height:asc',
	},
);

const getAddressFromParams = (params) => params.address
	|| getLisk32AddressFromPublicKey(params.publicKey);

const getTransactionsInAsc = async (params) => getTransactions({
	address: getAddressFromParams(params),
	sort: 'timestamp:asc',
	timestamp: params.timestamp,
	limit: params.limit || 10,
	offset: params.offset || 0,
});

const validateIfAccountExists = async (address) => {
	const tokenBalances = (await requestIndexer('token.balances', { address })).data;
	return !!tokenBalances.length;
};

const getCrossChainTransferTransactionInfo = async (params) => {
	const allEvents = await requestIndexer('events', {
		topic: params.address,
		timestamp: `${params.from}:${params.to}`,
		sort: 'timestamp:desc',
	});

	const transactions = [];
	const ccmTransferEvents = allEvents.data
		.filter(event => event.module === MODULE.TOKEN && event.name === EVENT.CCM_TRANSFER);

	/* eslint-disable no-await-in-loop */
	for (let i = 0; i < ccmTransferEvents.length; i++) {
		const [transactionID] = ccmTransferEvents[i].topics;

		transactions.push({
			id: transactionID,
			moduleCommand: `${MODULE.TOKEN}:${COMMAND.TRANSFER_CROSS_CHAIN}`,
			sender: {
				address: ccmTransferEvents[i].data.senderAddress,
			},
			block: ccmTransferEvents[i].block,
			params: ccmTransferEvents[i].data,
		});
	}
	/* eslint-enable no-await-in-loop */

	return transactions;
};

const validateIfAccountHasTransactions = async (address) => {
	const response = await getTransactions({ address, limit: 1 });
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
	const url = `${config.csv.baseUrl}?filename=${filename}`;
	return url;
};

const normalizeTransaction = async (address, tx, chainID) => {
	const {
		moduleCommand,
		senderPublicKey,
	} = tx;

	if (tx.moduleCommand === `${MODULE.TOKEN}:${COMMAND.TRANSFER_CROSS_CHAIN}`) {
		const [transaction] = (await requestIndexer('transactions', { id: tx.id })).data;
		chainID = transaction && transaction.params.sendingChainID
			? transaction.params.sendingChainID
			: chainID;
	}

	const date = dateFromTimestamp(tx.block.timestamp);
	const time = timeFromTimestamp(tx.block.timestamp);
	const amount = normalizeTransactionAmount(address, tx);
	const fee = normalizeTransactionFee(address, tx);
	const amountTokenID = tx.params.tokenID;
	const senderAddress = tx.sender.address;
	const recipientAddress = tx.params.recipientAddress || null;
	const recipientPublicKey = tx.meta && tx.meta.recipient && tx.meta.recipient.publicKey || null;
	const blockHeight = tx.block.height;
	const note = tx.params.data || null;
	const transactionID = tx.id;
	const sendingChainID = `'${chainID}`;
	const receivingChainID = `'${resolveReceivingChainID(tx, chainID)}`;

	return {
		date,
		time,
		amount,
		fee,
		amountTokenID,
		moduleCommand,
		senderAddress,
		recipientAddress,
		senderPublicKey,
		recipientPublicKey,
		blockHeight,
		note,
		transactionID,
		sendingChainID,
		receivingChainID,
	};
};

const parseTransactionsToCsv = (json) => {
	const opts = { delimiter: config.csv.delimiter, fields };
	return parseJsonToCsv(opts, json);
};

const transactionsToCSV = async (transactions, address, chainID) => {
	// Add duplicate entry with zero fees for self token transfer transactions
	transactions.forEach((tx, i, arr) => {
		if (checkIfSelfTokenTransfer(tx) && !tx.isSelfTokenTransferCredit) {
			arr.splice(i + 1, 0, { ...tx, fee: '0', isSelfTokenTransferCredit: true });
		}
	});

	const normalizedTransactions = await Promise.all(transactions
		.map(async (t) => normalizeTransaction(address, t, chainID)));

	return parseTransactionsToCsv(normalizedTransactions);
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

			const incomingCrossChainTransferTxs = await getCrossChainTransferTransactionInfo({
				...params,
				from: fromTimestampPast,
				to: toTimestampPast,
			});

			if (incomingCrossChainTransferTxs.length) {
				allTransactions.push(...incomingCrossChainTransferTxs);
			}

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

	if (!currentChainID) {
		const networkStatus = await getNetworkStatus();
		currentChainID = networkStatus.data.chainID;
	}

	const csv = await transactionsToCSV(
		allTransactions,
		getAddressFromParams(params),
		currentChainID,
	);

	await staticFiles.write(csvFilename, csv);
};

const scheduleTransactionExportQueue = Queue(
	config.endpoints.redis,
	config.queue.scheduleTransactionExport.name,
	exportTransactionsCSV,
	config.queue.scheduleTransactionExport.concurrency,
);

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
	const isAccountExists = await validateIfAccountExists(address);
	if (!isAccountExists) throw new NotFoundException(`Account ${address} not found.`);

	// Validate if account has transactions
	const isAccountHasTransactions = await validateIfAccountHasTransactions(address);
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

	if (!regex.CSV_EXPORT_FILENAME.test(filename)) {
		throw new ValidationException(`Invalid filename (${filename}) supplied.`);
	}

	const isFile = await staticFiles.isFile(filename);
	if (!isFile) throw new ValidationException(`Requested file (${filename}) does not exist.`);

	csvResponse.data = await staticFiles.read(filename);
	csvResponse.meta.filename = filename;

	// Remove the static file if end date is current date
	// TODO: Implement a better solution
	const splits = filename.split(/_|\./g);
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
