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
const excelJS = require('exceljs');
const xlsx = require('node-xlsx');

const moment = MomentRange.extendMoment(Moment);

const {
	CacheRedis,
	Exceptions: { NotFoundException, ValidationException },
	Queue,
	HTTP,
	Logger,
} = require('lisk-service-framework');

const config = require('../config');
const regex = require('./regex');
const FilesystemCache = require('./csvCache');
const fields = require('./excelFieldMappings');

const {
	getCurrentChainID,
	resolveReceivingChainID,

	getToday,
	getDaysInMilliseconds,
	dateFromTimestamp,
	timeFromTimestamp,
	normalizeTransactionAmount,
	normalizeTransactionFee,
	checkIfSelfTokenTransfer,
	getUniqueChainIDs,
} = require('./helpers');

const { requestAllStandard } = require('./helpers/requestAll');
const { checkIfIndexReadyForInterval } = require('./helpers/ready');
const { standardizeIntervalFromParams } = require('./helpers/time');
const { requestIndexer, requestAppRegistry } = require('./helpers/request');
const { MODULE, COMMAND, EVENT, LENGTH_ID, EVENT_TOPIC_PREFIX } = require('./helpers/constants');
const {
	getBlocksInAsc,
	getTransactionsInAsc,
	getEventsInAsc,
	getFeeTokenID,
} = require('./helpers/chain');
const {
	getAddressFromParams,
	checkIfAccountExists,
	checkIfAccountHasTransactions,
	getOpeningBalance,
} = require('./helpers/account');
const {
	getPartialFilenameFromParams,
	getExcelFilenameFromParams,
	getExcelFileUrlFromParams,
} = require('./helpers/file');

const partials = FilesystemCache(config.cache.partials);
const staticFiles = FilesystemCache(config.cache.exports);

const noTransactionsCache = CacheRedis('noTransactions', config.endpoints.volatileRedis);
const jobScheduledCache = CacheRedis('jobScheduled', config.endpoints.volatileRedis);

const DATE_FORMAT = config.excel.dateFormat;
const MAX_NUM_TRANSACTIONS = 10e5;

const logger = Logger();

const getCrossChainTransferTransactionInfo = async params => {
	const allEvents = await getEventsInAsc({
		...params,
		module: MODULE.TOKEN,
		name: EVENT.CCM_TRANSFER,
	});

	const transactions = [];
	const ccmTransferEvents = allEvents.filter(
		event => event.data.recipientAddress === params.address,
	);

	for (let i = 0; i < ccmTransferEvents.length; i++) {
		const ccmTransferEvent = ccmTransferEvents[i];
		const [ccuTransactionIDTopic] = ccmTransferEvent.topics;
		const ccuTransactionID =
			ccuTransactionIDTopic.length === EVENT_TOPIC_PREFIX.TX_ID.length + LENGTH_ID
				? ccuTransactionIDTopic.slice(EVENT_TOPIC_PREFIX.TX_ID.length)
				: ccuTransactionIDTopic;
		const [transaction] = (await requestIndexer('transactions', { id: ccuTransactionID })).data;
		transactions.push({
			id: ccuTransactionID,
			moduleCommand: transaction.moduleCommand,
			sender: { address: ccmTransferEvent.data.senderAddress },
			block: ccmTransferEvent.block,
			params: {
				...ccmTransferEvent.data,
				data: `This entry was generated from '${EVENT.CCM_TRANSFER}' event emitted from the specified CCU transactionID.`,
			},
			sendingChainID: transaction.params.sendingChainID,
			isIncomingCrossChainTransferTransaction: true,
		});
	}

	return transactions;
};

const getRewardAssignedInfo = async params => {
	const allEvents = await getEventsInAsc({
		...params,
		module: MODULE.POS,
		name: EVENT.REWARDS_ASSIGNED,
	});

	const transactions = [];
	const rewardsAssignedEvents = allEvents.filter(
		event => event.data.stakerAddress === params.address,
	);

	for (let i = 0; i < rewardsAssignedEvents.length; i++) {
		const rewardsAssignedEvent = rewardsAssignedEvents[i];
		const [transactionIDTopic] = rewardsAssignedEvent.topics;
		const transactionID =
			transactionIDTopic.length === EVENT_TOPIC_PREFIX.TX_ID.length + LENGTH_ID
				? transactionIDTopic.slice(EVENT_TOPIC_PREFIX.TX_ID.length)
				: transactionIDTopic;
		const [transaction] = (await requestIndexer('transactions', { id: transactionID })).data;

		transactions.push({
			id: transactionID,
			moduleCommand: transaction.moduleCommand,
			sender: { address: rewardsAssignedEvent.data.stakerAddress },
			block: rewardsAssignedEvent.block,
			params: {
				...rewardsAssignedEvent.data,
				data: `This entry was generated from '${EVENT.REWARDS_ASSIGNED}' event emitted from the specified transactionID.`,
			},
			rewardTokenID: rewardsAssignedEvent.data.tokenID,
			rewardAmount: rewardsAssignedEvent.data.amount,
		});
	}

	return transactions;
};

const normalizeBlocks = async blocks => {
	const normalizedBlocks = blocks.map(block => ({
		blockHeight: block.height,
		date: dateFromTimestamp(block.timestamp),
		time: timeFromTimestamp(block.timestamp),
		blockReward: block.reward,
	}));

	return normalizedBlocks;
};

const getBlockchainAppsMeta = async chainID => {
	try {
		const {
			data: [appMetadata],
		} = await requestAppRegistry('blockchain.apps.meta', { chainID });
		return appMetadata;
	} catch (error) {
		// Redirect call to the mainchain service
		const serviceURL = await requestIndexer('resolveMainchainServiceURL');
		const blockchainAppsStatsEndpoint = `${serviceURL}/api/v3/blockchain/apps/meta`;
		const { data: appMetadata } = await HTTP.get(blockchainAppsStatsEndpoint, { chainID });
		return appMetadata;
	}
};

const getChainInfo = async chainID => {
	const { chainName } = await getBlockchainAppsMeta(chainID);
	return { chainID, chainName };
};

const getMetadata = async (params, chainID, currentChainID) => ({
	...(await getChainInfo(chainID)),
	note: `Current Chain ID: ${currentChainID}`,
	openingBalance: await getOpeningBalance(params.address),
});

const resolveChainIDs = (tx, currentChainID) => {
	if (
		tx.moduleCommand === `${MODULE.TOKEN}:${COMMAND.TRANSFER}` ||
		tx.moduleCommand === `${MODULE.TOKEN}:${COMMAND.TRANSFER_CROSS_CHAIN}` ||
		tx.isIncomingCrossChainTransferTransaction
	) {
		const sendingChainID = tx.sendingChainID || currentChainID;
		const receivingChainID = resolveReceivingChainID(tx, currentChainID);

		return {
			sendingChainID,
			receivingChainID,
		};
	}
	return {};
};

const normalizeTransaction = (address, tx, currentChainID, txFeeTokenID) => {
	const { moduleCommand, senderPublicKey } = tx;

	const date = dateFromTimestamp(tx.block.timestamp);
	const time = timeFromTimestamp(tx.block.timestamp);
	const amount = normalizeTransactionAmount(address, tx);
	const fee = normalizeTransactionFee(address, tx);
	const amountTokenID = tx.params.tokenID;
	const senderAddress = tx.sender.address;
	const recipientAddress = tx.params.recipientAddress || null;
	const recipientPublicKey = (tx.meta && tx.meta.recipient && tx.meta.recipient.publicKey) || null;
	const blockHeight = tx.block.height;
	const note = tx.params.data || null;
	const transactionID = tx.id;
	const { sendingChainID, receivingChainID } = resolveChainIDs(tx, currentChainID);
	const { messageFeeTokenID } = tx.params;
	const { messageFee } = tx.params;
	const { rewardTokenID } = tx;
	const { rewardAmount } = tx;

	return {
		date,
		time,
		amount,
		fee,
		txFeeTokenID,
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
		messageFeeTokenID,
		messageFee,
		rewardTokenID,
		rewardAmount,
	};
};

const rescheduleOnTimeout = async params => {
	try {
		const currentChainID = await getCurrentChainID();
		const excelFilename = await getExcelFilenameFromParams(params, currentChainID);

		// Clear the flag to allow proper execution on user request if auto re-scheduling fails
		await jobScheduledCache.delete(excelFilename);

		const { address } = params;
		const requestInterval = await standardizeIntervalFromParams(params);
		logger.info(`Original job timed out. Re-scheduling job for ${address} (${requestInterval}).`);

		// eslint-disable-next-line no-use-before-define
		await scheduleTransactionExportQueue.add({ params });
	} catch (err) {
		logger.warn(`History export job Re-scheduling failed due to: ${err.message}`);
		logger.debug(err.stack);
	}
};

const exportTransactions = async job => {
	let timeout;

	const { params } = job.data;

	const allTransactions = [];
	const allBlocks = [];

	// Validate if account has transactions
	const isAccountHasTransactions = await checkIfAccountHasTransactions(params.address);
	if (isAccountHasTransactions) {
		// Add a timeout to automatically re-schedule, if the current job run times out on the last attempt
		if (job.attemptsMade === job.opts.attempts - 1) {
			timeout = setTimeout(
				rescheduleOnTimeout.bind(null, params),
				config.queue.scheduleTransactionExport.options.defaultJobOptions.timeout,
			);
		}

		const interval = await standardizeIntervalFromParams(params);
		const [from, to] = interval.split(':');
		const range = moment.range(moment(from, DATE_FORMAT), moment(to, DATE_FORMAT));
		const arrayOfDates = Array.from(range.by('day')).map(d => d.format(DATE_FORMAT));

		// eslint-disable-next-line no-restricted-syntax
		for (const day of arrayOfDates) {
			const partialFilename = await getPartialFilenameFromParams(params, day);

			// No history available for the specified day
			if ((await noTransactionsCache.get(partialFilename)) === true) {
				// eslint-disable-next-line no-continue
				continue;
			}

			// History available as a partial file for the specified day
			if (await partials.fileExists(partialFilename)) {
				const transactions = JSON.parse(await partials.read(partialFilename));
				allTransactions.push(...transactions);

				// eslint-disable-next-line no-continue
				continue;
			}

			// Query for history and build the partial
			const fromTimestamp = moment(day, DATE_FORMAT).startOf('day').unix();
			const toTimestamp = moment(day, DATE_FORMAT).endOf('day').unix();
			const timestampRange = `${fromTimestamp}:${toTimestamp}`;
			const transactions = await requestAllStandard(
				getTransactionsInAsc,
				{ ...params, timestamp: timestampRange },
				MAX_NUM_TRANSACTIONS,
			);
			allTransactions.push(...transactions);

			const incomingCrossChainTransferTxs = await getCrossChainTransferTransactionInfo({
				...params,
				timestamp: timestampRange,
			});

			const blocks = await getBlocksInAsc({
				...params,
				timestamp: timestampRange,
			});
			allBlocks.push(...blocks);

			const rewardAssignedInfo = await getRewardAssignedInfo({
				...params,
				timestamp: timestampRange,
			});

			if (incomingCrossChainTransferTxs.length || rewardAssignedInfo.length) {
				allTransactions.push(...incomingCrossChainTransferTxs, ...rewardAssignedInfo);
				allTransactions.sort((a, b) => a.block.height - b.block.height);
			}

			if (day !== getToday()) {
				if (transactions.length) {
					partials.write(partialFilename, JSON.stringify(allTransactions));
				} else {
					// Flag to prevent unnecessary calls to the node/file cache
					const RETENTION_PERIOD_MS = getDaysInMilliseconds(config.cache.partials.retentionInDays);
					await noTransactionsCache.set(partialFilename, true, RETENTION_PERIOD_MS);
				}
			}
		}
	}

	const currentChainID = await getCurrentChainID();
	const txFeeTokenID = await getFeeTokenID();
	const excelFilename = await getExcelFilenameFromParams(params, currentChainID);

	// Add duplicate entry with zero fees for self token transfer transactions
	allTransactions.forEach((tx, i, arr) => {
		if (checkIfSelfTokenTransfer(tx) && !tx.isSelfTokenTransferCredit) {
			arr.splice(i + 1, 0, { ...tx, fee: '0', isSelfTokenTransferCredit: true });
		}
	});

	const normalizedTransactions = await Promise.all(
		allTransactions.map(t =>
			normalizeTransaction(getAddressFromParams(params), t, currentChainID, txFeeTokenID),
		),
	);

	const normalizedBlocks = await normalizeBlocks(allBlocks);

	const uniqueChainIDs = await getUniqueChainIDs(normalizedTransactions);
	const metadata = await Promise.all(
		uniqueChainIDs.map(async chainID => getMetadata(params, chainID, currentChainID)),
	);

	const workBook = new excelJS.Workbook();
	const transactionExportSheet = workBook.addWorksheet(config.excel.sheets.TRANSACTION_HISTORY);
	const metadataSheet = workBook.addWorksheet(config.excel.sheets.METADATA);
	transactionExportSheet.columns = fields.transactionMappings;
	metadataSheet.columns = fields.metadataMappings;

	transactionExportSheet.addRows([...normalizedTransactions, ...normalizedBlocks]);
	metadataSheet.addRows(metadata);

	await workBook.xlsx.writeFile(`${config.cache.exports.dirPath}/${excelFilename}`);
	await jobScheduledCache.delete(excelFilename); // Remove the entry from cache to free up memory

	// Clear the auto re-schedule timeout on successful completion
	clearTimeout(timeout);
};

const scheduleTransactionExportQueue = Queue(
	config.endpoints.redis,
	config.queue.scheduleTransactionExport.name,
	exportTransactions,
	config.queue.scheduleTransactionExport.concurrency,
	config.queue.scheduleTransactionExport.options,
);

const scheduleTransactionHistoryExport = async params => {
	const exportResponse = {
		data: {},
		meta: {
			ready: false,
		},
	};

	const { publicKey } = params;
	const address = getAddressFromParams(params);
	const requestInterval = await standardizeIntervalFromParams(params);

	exportResponse.data.address = address;
	exportResponse.data.publicKey = publicKey;
	exportResponse.data.interval = requestInterval;

	const currentChainID = await getCurrentChainID();
	const excelFilename = await getExcelFilenameFromParams(params, currentChainID);

	// Job already scheduled, skip remaining checks
	if ((await jobScheduledCache.get(excelFilename)) === true) {
		return exportResponse;
	}

	// Request already processed and the history is ready to be downloaded
	if (await staticFiles.fileExists(excelFilename)) {
		exportResponse.data.fileName = excelFilename;
		exportResponse.data.fileUrl = await getExcelFileUrlFromParams(params, currentChainID);
		exportResponse.meta.ready = true;

		return exportResponse;
	}

	// Validate if account exists
	const isAccountExists = await checkIfAccountExists(address);
	if (!isAccountExists) throw new NotFoundException(`Account ${address} not found.`);

	// Validate if the index is ready enough to serve the user request
	const isBlockchainIndexReady = await checkIfIndexReadyForInterval(requestInterval);
	if (!isBlockchainIndexReady) {
		throw new ValidationException(
			`The blockchain index is not yet ready for the requested interval (${requestInterval}). Please retry later.`,
		);
	}

	// Schedule a new job to process the history export
	await scheduleTransactionExportQueue.add({ params: { ...params, address } });
	exportResponse.status = 'ACCEPTED';

	const ttl =
		config.queue.scheduleTransactionExport.options.defaultJobOptions.timeout *
		config.queue.scheduleTransactionExport.options.defaultJobOptions.attempts;
	await jobScheduledCache.set(excelFilename, true, ttl);

	return exportResponse;
};

const downloadTransactionHistory = async ({ filename }) => {
	const excelResponse = {
		data: {},
		meta: {},
	};

	if (!regex.EXCEL_EXPORT_FILENAME.test(filename)) {
		throw new ValidationException(`Invalid filename (${filename}) supplied.`);
	}

	const isFile = await staticFiles.isFile(filename);
	if (!isFile) throw new NotFoundException(`Requested file (${filename}) does not exist.`);

	excelResponse.data = xlsx
		.build(xlsx.parse(`${config.cache.exports.dirPath}/${filename}`))
		.toString('hex');
	excelResponse.meta.filename = filename;

	// Remove the static file if endDate is current date
	const filenameSplits = filename.split(/_|\./g);
	const endDate = filenameSplits.at(-2);
	if (endDate === getToday()) staticFiles.remove(filename);

	return excelResponse;
};

module.exports = {
	exportTransactions,
	scheduleTransactionHistoryExport,
	downloadTransactionHistory,

	// For functional tests
	normalizeTransaction,

	getCrossChainTransferTransactionInfo,
	getRewardAssignedInfo,
	getMetadata,
	resolveChainIDs,
	normalizeBlocks,
};
