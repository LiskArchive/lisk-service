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
} = require('lisk-service-framework');

const {
	getLisk32AddressFromPublicKey,
	getCurrentChainID,
	resolveReceivingChainID,
	getNetworkStatus,
	MODULE,
	COMMAND,
	EVENT,
	MODULE_SUB_STORE,
	requestIndexer,
	requestConnector,
	requestAppRegistry,
	getDaysInMilliseconds,
	dateFromTimestamp,
	timeFromTimestamp,
	normalizeTransactionAmount,
	normalizeTransactionFee,
	checkIfSelfTokenTransfer,
	getUniqueChainIDs,
} = require('./helpers');

const config = require('../config');
const fields = require('./excelFieldMappings');

const { requestAllCustom, requestAllStandard } = require('./requestAll');
const FilesystemCache = require('./csvCache');
const regex = require('./regex');

const partials = FilesystemCache(config.cache.partials);
const staticFiles = FilesystemCache(config.cache.exports);

const noTransactionsCache = CacheRedis('noTransactions', config.endpoints.volatileRedis);

const DATE_FORMAT = config.excel.dateFormat;
const MAX_NUM_TRANSACTIONS = 10000;

let tokenModuleData;
let feeTokenID;
let defaultStartDate;

const getTransactions = async params => requestIndexer('transactions', params);
const getBlocks = async params => requestIndexer('blocks', params);

const getGenesisBlock = async height => requestIndexer('blocks', { height });

const getAddressFromParams = params =>
	params.address || getLisk32AddressFromPublicKey(params.publicKey);

const getTransactionsInAsc = async params =>
	getTransactions({
		address: getAddressFromParams(params),
		sort: 'timestamp:asc',
		timestamp: params.timestamp,
		limit: params.limit || 10,
		offset: params.offset || 0,
	});

const validateIfAccountExists = async address => {
	const { data: tokenBalances } = await requestIndexer('token.balances', { address });
	return !!tokenBalances.length;
};

const getEvents = async params =>
	requestAllStandard(requestIndexer.bind(null, 'events'), {
		topic: params.address,
		timestamp: params.timestamp,
		module: params.module,
		name: params.name,
		sort: 'timestamp:desc',
	});

const getCrossChainTransferTransactionInfo = async params => {
	const allEvents = await getEvents({
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
		const [ccuTransactionID] = ccmTransferEvent.topics;
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
	const allEvents = await getEvents({
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
		const [transactionID] = rewardsAssignedEvent.topics;
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

const getBlocksInAsc = async params => {
	const totalBlocks = (
		await getBlocks({
			generatorAddress: params.address,
			timestamp: params.timestamp,
			limit: 1,
		})
	).meta.total;

	const blocks = await requestAllStandard(
		getBlocks,
		{
			generatorAddress: params.address,
			timestamp: params.timestamp,
			sort: 'timestamp:desc',
		},
		totalBlocks,
	);

	return blocks;
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

const getOpeningBalance = async address => {
	if (!tokenModuleData) {
		const genesisBlockAssetsLength = await requestConnector('getGenesisAssetsLength', {
			module: MODULE.TOKEN,
			subStore: MODULE_SUB_STORE.TOKEN.USER,
		});
		const totalUsers = genesisBlockAssetsLength[MODULE.TOKEN][MODULE_SUB_STORE.TOKEN.USER];

		tokenModuleData = (
			await requestAllCustom(
				requestConnector,
				'getGenesisAssetByModule',
				{ module: MODULE.TOKEN, subStore: MODULE_SUB_STORE.TOKEN.USER },
				totalUsers,
			)
		).userSubstore;
	}

	const filteredAccount = tokenModuleData.find(e => e.address === address);
	const openingBalance = filteredAccount
		? { tokenID: filteredAccount.tokenID, amount: filteredAccount.availableBalance }
		: null;

	return openingBalance;
};

const getFeeTokenID = async () => {
	if (!feeTokenID) {
		feeTokenID = requestConnector('getFeeTokenID');
	}

	return feeTokenID;
};

const getMetadata = async (params, chainID, currentChainID) => ({
	...(await getChainInfo(chainID)),
	note: `Current Chain ID: ${currentChainID}`,
	openingBalance: await getOpeningBalance(params.address),
});

const validateIfAccountHasTransactions = async address => {
	const response = await getTransactions({ address, limit: 1 });
	return !!response.data.length;
};

const getDefaultStartDate = async () => {
	if (!defaultStartDate) {
		const {
			data: { genesisHeight },
		} = await getNetworkStatus();
		const {
			data: [block],
		} = await getGenesisBlock(genesisHeight);
		defaultStartDate = moment(block.timestamp * 1000).format(DATE_FORMAT);
	}

	return defaultStartDate;
};

const getToday = () => moment().format(DATE_FORMAT);

const standardizeIntervalFromParams = async ({ interval }) => {
	let from;
	let to;
	if (interval && interval.includes(':')) {
		[from, to] = interval.split(':');
		if (moment(to, DATE_FORMAT).diff(moment(from, DATE_FORMAT)) < 0) {
			throw new ValidationException(`Invalid interval supplied: ${interval}.`);
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

const getExcelFilenameFromParams = async (params, chainID) => {
	const address = getAddressFromParams(params);
	const [from, to] = (await standardizeIntervalFromParams(params)).split(':');

	const filename = `transactions_${chainID}_${address}_${from}_${to}.xlsx`;
	return filename;
};

const getExcelFileUrlFromParams = async (params, chainID) => {
	const filename = await getExcelFilenameFromParams(params, chainID);
	const url = `${config.excel.baseURL}?filename=${filename}`;
	return url;
};

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

const exportTransactions = async job => {
	const { params } = job.data;

	const allTransactions = [];
	const allBlocks = [];

	// Validate if account has transactions
	const isAccountHasTransactions = await validateIfAccountHasTransactions(params.address);
	if (isAccountHasTransactions) {
		const interval = await standardizeIntervalFromParams(params);
		const [from, to] = interval.split(':');
		const range = moment.range(moment(from, DATE_FORMAT), moment(to, DATE_FORMAT));
		const arrayOfDates = Array.from(range.by('day')).map(d => d.format(DATE_FORMAT));

		for (let i = 0; i < arrayOfDates.length; i++) {
			const day = arrayOfDates[i];
			const partialFilename = await getPartialFilenameFromParams(params, day);
			if (await partials.fileExists(partialFilename)) {
				const transactions = JSON.parse(await partials.read(partialFilename));
				allTransactions.push(...transactions);
			} else if ((await noTransactionsCache.get(partialFilename)) !== true) {
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
						// Flag to prevent unnecessary calls to core/storage space usage on the file cache
						const RETENTION_PERIOD_MS = getDaysInMilliseconds(
							config.cache.partials.retentionInDays,
						);
						await noTransactionsCache.set(partialFilename, true, RETENTION_PERIOD_MS);
					}
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
};

const scheduleTransactionExportQueue = Queue(
	config.endpoints.redis,
	config.queue.scheduleTransactionExport.name,
	exportTransactions,
	config.queue.scheduleTransactionExport.concurrency,
);

const scheduleTransactionHistoryExport = async params => {
	// Schedule only when index is completely built
	const isBlockchainIndexReady = await requestIndexer('isBlockchainFullyIndexed');
	if (!isBlockchainIndexReady)
		throw new ValidationException('The blockchain index is not yet ready. Please retry later.');

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

	exportResponse.data.address = address;
	exportResponse.data.publicKey = publicKey;
	exportResponse.data.interval = await standardizeIntervalFromParams(params);

	const currentChainID = await getCurrentChainID();
	const excelFilename = await getExcelFilenameFromParams(params, currentChainID);
	if (await staticFiles.fileExists(excelFilename)) {
		exportResponse.data.fileName = excelFilename;
		exportResponse.data.fileUrl = await getExcelFileUrlFromParams(params, currentChainID);
		exportResponse.meta.ready = true;
	} else {
		await scheduleTransactionExportQueue.add({ params: { ...params, address } });
		exportResponse.status = 'ACCEPTED';
	}

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
	getAddressFromParams,
	getToday,
	normalizeTransaction,

	standardizeIntervalFromParams,
	getPartialFilenameFromParams,
	getExcelFilenameFromParams,
	getExcelFileUrlFromParams,
	getCrossChainTransferTransactionInfo,
	getRewardAssignedInfo,
	getOpeningBalance,
	getMetadata,
	resolveChainIDs,
	normalizeBlocks,
};
