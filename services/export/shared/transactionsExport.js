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
	getToday,
	getDaysInMilliseconds,
	dateFromTimestamp,
	timeFromTimestamp,
	getUniqueChainIDs,
} = require('./helpers');

const { dropDuplicatesDeep } = require('./helpers/array');
const { checkIfIndexReadyForInterval } = require('./helpers/ready');
const { standardizeIntervalFromParams } = require('./helpers/time');
const { requestIndexer, requestAppRegistry } = require('./helpers/request');
const { getTransactionIDFromTopic0, getCcmIDFromTopic0 } = require('./helpers/event');
const {
	MODULE,
	EVENT,
	LENGTH_ID,
	EVENT_TOPIC_PREFIX,
	LENGTH_DEFAULT_TOPIC,
	COMMAND,
	STATUS,
} = require('./helpers/constants');
const {
	resolveChainIDs,
	getBlocks,
	getTransactions,
	getEvents,
	getAllBlocksInAsc,
	getAllTransactionsInAsc,
	getAllEventsInAsc,
	getFeeTokenID,
	getPosTokenID,
} = require('./helpers/chain');
const {
	getAddressFromParams,
	checkIfAccountExists,
	checkIfAccountHasTransactions,
	checkIfAccountIsValidator,
	getOpeningBalances,
	cachePublicKey,
	getPublicKeyByAddress,
} = require('./helpers/account');
const {
	normalizeTransactionAmount,
	normalizeTransactionFee,
	normalizeMessageFee,
	checkIfSelfTokenTransfer,
} = require('./helpers/transaction');
const {
	getPartialFilenameFromParams,
	getExcelFilenameFromParams,
	getExcelFileUrlFromParams,
} = require('./helpers/file');

const partials = FilesystemCache(config.cache.partials);
const staticFiles = FilesystemCache(config.cache.exports);

const noHistoryCache = CacheRedis('noHistory', config.endpoints.volatileRedis);
const jobScheduledCache = CacheRedis('jobScheduled', config.endpoints.volatileRedis);

const DATE_FORMAT = config.excel.dateFormat;

const logger = Logger();

const formatBlocks = async blocks => {
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
			data: [appMetadata = {}],
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

const getMetadataEntries = async (params, chainID, currentChainID) => {
	const chainInfo = await getChainInfo(chainID);

	if (chainID === currentChainID) {
		const openingBalances = await getOpeningBalances(params.address);
		const metadataEntries = openingBalances.map(e => ({
			...chainInfo,
			note: `Current Chain ID: ${currentChainID}`,
			openingBalanceAmount: e.amount,
			tokenID: e.tokenID,
		}));
		if (metadataEntries.length) return metadataEntries;
	}

	return [
		{
			...chainInfo,
			note: `Current Chain ID: ${currentChainID}`,
			openingBalanceAmount: null,
			tokenID: null,
		},
	];
};

const formatTransaction = async (addressFromParams, tx, currentChainID, txFeeTokenID) => {
	const { moduleCommand, senderPublicKey } = tx;

	const date = dateFromTimestamp(tx.block.timestamp);
	const time = timeFromTimestamp(tx.block.timestamp);
	const amount = normalizeTransactionAmount(addressFromParams, tx, currentChainID);
	const fee = normalizeTransactionFee(addressFromParams, tx);
	const amountTokenID = tx.params.tokenID;
	const senderAddress = tx.sender.address;
	const recipientAddress = tx.params.recipientAddress || null;
	const recipientPublicKey =
		(tx.meta && tx.meta.recipient && tx.meta.recipient.publicKey) ||
		(await getPublicKeyByAddress(recipientAddress));
	const blockHeight = tx.block.height;
	const note = tx.params.data || null;
	const transactionID = tx.id;
	const { sendingChainID, receivingChainID } = resolveChainIDs(tx, currentChainID);

	if (senderPublicKey) cachePublicKey(senderPublicKey);
	if (recipientPublicKey) cachePublicKey(recipientPublicKey);

	return {
		date,
		time,
		blockHeight,
		transactionID,
		moduleCommand,
		fee,
		txFeeTokenID,
		amount,
		amountTokenID,
		senderAddress,
		senderPublicKey,
		recipientAddress,
		recipientPublicKey,
		note,
		sendingChainID,
		receivingChainID,
	};
};

const getGeneratorFeeEntries = async (addressFromParams, genFeeEvent, tx, block) => {
	const entries = [];

	const senderPublicKey = tx.sender.publicKey;
	cachePublicKey(senderPublicKey);

	const { senderAddress, generatorAddress } = genFeeEvent.data;
	if (generatorAddress !== addressFromParams) {
		return entries;
	}

	const generatorAmount = BigInt(genFeeEvent.data.generatorAmount);
	if (generatorAmount !== BigInt('0')) {
		entries.push({
			date: dateFromTimestamp(block.timestamp),
			time: timeFromTimestamp(block.timestamp),
			blockHeight: block.height,
			transactionID: tx.id,
			moduleCommand: null,
			fee: null,
			txFeeTokenID: null,
			amount: generatorAmount.toString(),
			amountTokenID: await getFeeTokenID(),
			senderAddress,
			senderPublicKey,
			recipientAddress: generatorAddress,
			recipientPublicKey: await getPublicKeyByAddress(generatorAddress),
			note: 'Generator Fee',
			sendingChainID: await getCurrentChainID(),
			receivingChainID: await getCurrentChainID(),
		});
	}

	return entries;
};

const getOutgoingTransferCCEntries = async (
	addressFromParams,
	transferCrossChainEvent,
	ccmSendSuccessEvent,
	tx,
	block,
) => {
	const entries = [];

	const currentChainID = await getCurrentChainID();

	const senderPublicKey = tx.sender.publicKey;
	const recipientPublicKey = tx.meta && tx.meta.recipient && tx.meta.recipient.publicKey;

	if (senderPublicKey) cachePublicKey(senderPublicKey);
	if (recipientPublicKey) cachePublicKey(recipientPublicKey);

	entries.push({
		date: dateFromTimestamp(block.timestamp),
		time: timeFromTimestamp(block.timestamp),
		blockHeight: block.height,
		transactionID: tx.id,
		moduleCommand: tx.moduleCommand,
		fee: normalizeTransactionFee(addressFromParams, tx),
		txFeeTokenID: await getFeeTokenID(),
		amount: normalizeTransactionAmount(addressFromParams, tx, currentChainID),
		amountTokenID: tx.params.tokenID,
		senderAddress: addressFromParams,
		senderPublicKey,
		recipientAddress: tx.params.recipientAddress,
		recipientPublicKey:
			recipientPublicKey || (await getPublicKeyByAddress(tx.params.recipientAddress)),
		note: tx.params.data,
		sendingChainID: currentChainID,
		receivingChainID: transferCrossChainEvent.data.receivingChainID,
	});

	if (ccmSendSuccessEvent) {
		entries.push({
			date: dateFromTimestamp(block.timestamp),
			time: timeFromTimestamp(block.timestamp),
			blockHeight: block.height,
			transactionID: tx.id,
			moduleCommand: null,
			fee: null,
			txFeeTokenID: null,
			amount: normalizeMessageFee(tx),
			amountTokenID: tx.params.messageFeeTokenID,
			senderAddress: tx.sender.address,
			senderPublicKey,
			recipientAddress: null,
			recipientPublicKey: null,
			note: 'Message Fee',
			sendingChainID: await getCurrentChainID(),
			receivingChainID: ccmSendSuccessEvent.data.ccm.receivingChainID,
		});
	}
	return entries;
};

const getIncomingTransferCCEntries = async (addressFromParams, ccmTransferEvent, tx, block) => {
	const entries = [];

	if (ccmTransferEvent.data.result !== STATUS.EVENT_CCM_TRANSFER_RESULT.SUCCESSFUL) {
		return entries;
	}

	entries.push({
		date: dateFromTimestamp(block.timestamp),
		time: timeFromTimestamp(block.timestamp),
		blockHeight: block.height,
		transactionID: tx.id,
		moduleCommand: null,
		fee: null,
		txFeeTokenID: null,
		amount: ccmTransferEvent.data.amount,
		amountTokenID: ccmTransferEvent.data.tokenID,
		senderAddress: ccmTransferEvent.data.senderAddress,
		senderPublicKey: await getPublicKeyByAddress(ccmTransferEvent.data.senderAddress),
		recipientAddress: addressFromParams,
		recipientPublicKey: await getPublicKeyByAddress(addressFromParams),
		note: 'Incoming CCM from specified CCU transactionID',
		sendingChainID: tx.params.sendingChainID,
		receivingChainID: ccmTransferEvent.data.receivingChainID,
	});

	return entries;
};

const getMessageFeeEntries = async (
	addressFromParams,
	relayerFeeProcessedEvent,
	tx,
	block,
	messageFeeTokenID,
	sendingChainID,
	receivingChainID,
) => {
	const entries = [];

	const relayerAmount = BigInt(relayerFeeProcessedEvent.data.relayerAmount);
	if (relayerAmount === BigInt('0')) return entries;

	entries.push({
		date: dateFromTimestamp(block.timestamp),
		time: timeFromTimestamp(block.timestamp),
		blockHeight: block.height,
		transactionID: tx.id,
		moduleCommand: tx.moduleCommand,
		fee: null,
		txFeeTokenID: null,
		amount: relayerAmount.toString(),
		amountTokenID: messageFeeTokenID,
		senderAddress: null,
		senderPublicKey: null,
		recipientAddress: addressFromParams,
		recipientPublicKey: await getPublicKeyByAddress(addressFromParams),
		note: 'Message fee for relayer',
		sendingChainID,
		receivingChainID,
	});

	return entries;
};

const getLegacyAccountReclaimEntries = async (
	addressFromParams,
	accountReclaimedEvent,
	tx,
	block,
) => {
	const entries = [];

	entries.push({
		date: dateFromTimestamp(block.timestamp),
		time: timeFromTimestamp(block.timestamp),
		blockHeight: block.height,
		transactionID: tx.id,
		moduleCommand: null,
		fee: null,
		txFeeTokenID: null,
		amount: accountReclaimedEvent.data.amount,
		amountTokenID: await getFeeTokenID(),
		senderAddress: null,
		senderPublicKey: null,
		recipientAddress: addressFromParams,
		recipientPublicKey: await getPublicKeyByAddress(addressFromParams),
		note: 'Legacy account balance reclaimed',
		sendingChainID: await getCurrentChainID(),
		receivingChainID: await getCurrentChainID(),
	});

	return entries;
};

const getPomEntries = async (
	addressFromParams,
	tokenTransferEvent,
	validatorPunishedEvent,
	tx,
	block,
) => {
	const entries = [];

	const isPunishedValidator = addressFromParams === validatorPunishedEvent.data.address;

	entries.push({
		date: dateFromTimestamp(block.timestamp),
		time: timeFromTimestamp(block.timestamp),
		blockHeight: block.height,
		transactionID: tx.id,
		moduleCommand: null,
		fee: null,
		txFeeTokenID: null,
		amount: (
			BigInt(isPunishedValidator ? '-1' : '1') * BigInt(tokenTransferEvent.data.amount)
		).toString(),
		amountTokenID: await getPosTokenID(),
		senderAddress: tokenTransferEvent.data.senderAddress,
		senderPublicKey: await getPublicKeyByAddress(tokenTransferEvent.data.senderAddress),
		recipientAddress: tokenTransferEvent.data.recipientAddress,
		recipientPublicKey: await getPublicKeyByAddress(tokenTransferEvent.data.recipientAddress),
		note: isPunishedValidator
			? 'PoM punishment validator reward deduction'
			: 'PoM successful report reward',
		sendingChainID: await getCurrentChainID(),
		receivingChainID: await getCurrentChainID(),
	});

	return entries;
};

const getSharedRewardsAssignedEntries = async (
	addressFromParams,
	rewardsAssignedEvent,
	tx,
	block,
) => {
	const entries = [];

	const recipientPublicKey = tx.sender.publicKey;
	if (recipientPublicKey) cachePublicKey(recipientPublicKey);

	const isStaker = addressFromParams === rewardsAssignedEvent.data.stakerAddress;
	entries.push({
		date: dateFromTimestamp(block.timestamp),
		time: timeFromTimestamp(block.timestamp),
		blockHeight: block.height,
		transactionID: tx.id,
		moduleCommand: null,
		fee: null,
		txFeeTokenID: null,
		// because amount increases the staker balance and reduces the validator balance
		amount: (BigInt(isStaker ? '1' : '-1') * BigInt(rewardsAssignedEvent.data.amount)).toString(),
		amountTokenID: await getPosTokenID(),
		senderAddress: rewardsAssignedEvent.data.validatorAddress,
		senderPublicKey: await getPublicKeyByAddress(rewardsAssignedEvent.data.validatorAddress),
		recipientAddress: rewardsAssignedEvent.data.stakerAddress,
		recipientPublicKey,
		note: 'Custodial shared rewards transfer to the staker',
		sendingChainID: await getCurrentChainID(),
		receivingChainID: await getCurrentChainID(),
	});

	return entries;
};

const getBlockRewardEntries = async (
	addressFromParams,
	tokenMintedEvent,
	tokenLockedEvent,
	block,
) => {
	const entries = [];

	const sharedReward = tokenLockedEvent ? BigInt(tokenLockedEvent.data.amount) : BigInt('0');
	const commissionAndSelfStakeReward = BigInt(tokenMintedEvent.data.amount) - sharedReward;

	const commonEntryProperties = {
		date: dateFromTimestamp(block.timestamp),
		time: timeFromTimestamp(block.timestamp),
		blockHeight: block.height,
		transactionID: null,
		moduleCommand: null,
		fee: null,
		txFeeTokenID: null,
		amountTokenID: await getPosTokenID(),
		senderAddress: null,
		senderPublicKey: null,
		recipientAddress: addressFromParams,
		recipientPublicKey: block.generator.publicKey,
		sendingChainID: await getCurrentChainID(),
		receivingChainID: await getCurrentChainID(),
	};

	cachePublicKey(block.generator.publicKey);

	entries.push({
		...commonEntryProperties,
		amount: commissionAndSelfStakeReward.toString(),
		note: 'Block generation reward (commission + self-stake)',
	});

	if (tokenLockedEvent) {
		entries.push({
			...commonEntryProperties,
			amount: sharedReward.toString(),
			note: 'Block generation reward (custodial shared rewards locked)',
		});
	}

	return entries;
};

const getEntriesByChronology = async (params, sortedBlocks, sortedTransactions, sortedEvents) => {
	const entries = [];

	const currentChainID = await getCurrentChainID();
	const txFeeTokenID = await getFeeTokenID();
	const addressFromParams = getAddressFromParams(params);

	// Loop through each event and process the corresponding event, transaction, block
	for (let i = 0; i < sortedEvents.length; i++) {
		const e = sortedEvents[i];
		const [topic0] = e.topics;
		const lengthTopic0 = topic0.length;

		if (
			lengthTopic0 === LENGTH_ID + EVENT_TOPIC_PREFIX.TX_ID.length ||
			lengthTopic0 === LENGTH_ID + EVENT_TOPIC_PREFIX.CCM_ID.length
		) {
			const otherNecessaryEvents = [];
			const ccmID = getCcmIDFromTopic0(topic0);
			const tx = await (async () => {
				const transactionID =
					ccmID === null
						? getTransactionIDFromTopic0(topic0)
						: await (async () => {
								// If current event's topic0 is a ccmID, determine the CCU transaction ID from the corresponding beforeCCCExecution event
								let j = i - 1;
								while (j--) {
									const prevEvent = sortedEvents[j];
									if (
										prevEvent.module === MODULE.TOKEN &&
										prevEvent.name === EVENT.BEFORE_CCC_EXECUTION &&
										prevEvent.data.ccmID === ccmID
									) {
										return getTransactionIDFromTopic0(prevEvent.topics[0]);
									}
								}

								const eventsForHeight = await getEvents({ height: String(e.block.height) });
								otherNecessaryEvents.push(...eventsForHeight.data);
								const correspondingBeforeCCCExecutionEvent = otherNecessaryEvents.find(
									eventForHeight =>
										eventForHeight.module === MODULE.TOKEN &&
										eventForHeight.name === EVENT.BEFORE_CCC_EXECUTION &&
										eventForHeight.data.ccmID === ccmID,
								);
								if (correspondingBeforeCCCExecutionEvent) {
									return getTransactionIDFromTopic0(correspondingBeforeCCCExecutionEvent.topics[0]);
								}

								logger.warn(
									`Cannot determine CCU transactionID for ccmID ${ccmID} from event:\n${JSON.stringify(
										e,
										null,
										'\t',
									)}`,
								);
								throw Error(`CCU transactionID cannot be determined for ccmID ${ccmID}.`);
						  })();

				const txInList = sortedTransactions.find(t => t.id === transactionID);
				if (txInList) return txInList;

				// because transaction may not be available for validator custodial reward reduction in the sorted list
				const [txFromIndexer] = (await getTransactions({ id: transactionID })).data;
				return txFromIndexer;
			})();
			const block = await (async () => {
				const blockID = tx.block.id;
				const blockInList = sortedBlocks.find(b => b.id === blockID);
				if (blockInList) return blockInList;

				// because block may not be available for validator custodial reward reduction in the sorted list
				const [blockFromIndexer] = (await getBlocks({ id: blockID })).data;
				return blockFromIndexer;
			})();

			// Handle transaction and CCM related events
			if (
				(topic0.startsWith(EVENT_TOPIC_PREFIX.TX_ID) &&
					lengthTopic0 === LENGTH_ID + EVENT_TOPIC_PREFIX.TX_ID.length) ||
				(topic0.startsWith(EVENT_TOPIC_PREFIX.CCM_ID) &&
					lengthTopic0 === LENGTH_ID + EVENT_TOPIC_PREFIX.CCM_ID.length)
			) {
				// Every transaction first emits a token lock event
				if (
					e.module === MODULE.TOKEN &&
					e.name === EVENT.LOCK &&
					// token:transferCrossChain transaction is addressed separately
					tx.moduleCommand !== `${MODULE.TOKEN}:${COMMAND.TRANSFER_CROSS_CHAIN}`
				) {
					entries.push(
						await formatTransaction(addressFromParams, tx, currentChainID, txFeeTokenID),
					);

					// Add duplicate entry with zero fees for self token transfer transactions
					if (checkIfSelfTokenTransfer(tx)) {
						const dupTx = { ...tx, fee: null, isSelfTokenTransferCredit: true };
						entries.push(
							await formatTransaction(addressFromParams, dupTx, currentChainID, txFeeTokenID),
						);
					}
				}

				// generatorAmount is the (excessive) transaction fee left after burning the transaction minFee
				if (e.module === MODULE.FEE && e.name === EVENT.GENERATOR_FEE_PROCESSED) {
					const generatorFeeEntries = await getGeneratorFeeEntries(addressFromParams, e, tx, block);
					entries.push(...generatorFeeEntries);
				}

				// Outgoing cross-chain transfers
				if (
					e.module === MODULE.TOKEN &&
					e.name === EVENT.TRANSFER_CROSS_CHAIN &&
					e.data.senderAddress === addressFromParams
				) {
					const transferCrossChainEvent = e;
					const ccmSendSuccessEvent = await (async () => {
						const txID = tx.id;
						const topicTxID = EVENT_TOPIC_PREFIX.TX_ID.concat(txID);
						const txHeight = tx.block.height;
						const allBlockEvents = await getAllEventsInAsc({ height: String(txHeight) });
						return allBlockEvents.find(
							ev =>
								ev.module === MODULE.INTEROPERABILITY &&
								ev.name === EVENT.CCM_SEND_SUCCESS &&
								ev.topics.includes(topicTxID),
						);
					})();
					const outgoingCCTransferEntries = await getOutgoingTransferCCEntries(
						addressFromParams,
						transferCrossChainEvent,
						ccmSendSuccessEvent,
						tx,
						block,
					);
					entries.push(...outgoingCCTransferEntries);
				}

				// Incoming cross-chain transfers
				if (
					e.module === MODULE.TOKEN &&
					e.name === EVENT.CCM_TRANSFER &&
					e.data.recipientAddress === addressFromParams &&
					e.data.receivingChainID === (await getCurrentChainID())
				) {
					const incomingCCTransferEntries = await getIncomingTransferCCEntries(
						addressFromParams,
						e,
						tx,
						block,
					);
					entries.push(...incomingCCTransferEntries);
				}

				// messageFee is the (excessive) transaction fee left after burning the necessary CCM execution fee
				if (e.module === MODULE.FEE && e.name === EVENT.RELAYER_FEE_PROCESSED) {
					const messageFeeTokenID = (() => {
						// Determine the messageFeeTokenID from the corresponding token:beforeCCCExecution event
						const correspondingBeforeCCCExecutionEvent = sortedEvents
							.concat(otherNecessaryEvents)
							.find(
								eventForHeight =>
									eventForHeight.module === MODULE.TOKEN &&
									eventForHeight.name === EVENT.BEFORE_CCC_EXECUTION &&
									eventForHeight.data.ccmID === e.data.ccmID,
							);
						if (correspondingBeforeCCCExecutionEvent) {
							return correspondingBeforeCCCExecutionEvent.data.messageFeeTokenID;
						}

						logger.warn(
							`Cannot determine messageFeeTokenID for ccmID ${ccmID} from event:\n${JSON.stringify(
								e,
								null,
								'\t',
							)}`,
						);
						throw Error(`messageFeeTokenID cannot be determined for ccmID ${ccmID}.`);
					})();
					const { sendingChainID, receivingChainID } = (() => {
						// Determine the sendingChainID from the corresponding interoperability:ccmProcessed event
						const correspondingCcmProcessedEvent = sortedEvents
							.concat(otherNecessaryEvents)
							.find(
								eventForHeight =>
									eventForHeight.module === MODULE.INTEROPERABILITY &&
									eventForHeight.name === EVENT.CCM_PROCESSED &&
									eventForHeight.topics[0] === e.topics[0],
							);
						if (correspondingCcmProcessedEvent) {
							return {
								sendingChainID: correspondingCcmProcessedEvent.data.ccm.sendingChainID,
								receivingChainID: correspondingCcmProcessedEvent.data.ccm.receivingChainID,
							};
						}

						logger.warn(
							`Cannot determine sendingChainID & receivingChainID for ccmID ${ccmID} from event:\n${JSON.stringify(
								e,
								null,
								'\t',
							)}`,
						);
						throw Error(
							`sendingChainID & receivingChainID cannot be determined for ccmID ${ccmID}.`,
						);
					})();

					const messageFeeEntries = await getMessageFeeEntries(
						addressFromParams,
						e,
						tx,
						block,
						messageFeeTokenID,
						sendingChainID,
						receivingChainID,
					);
					entries.push(...messageFeeEntries);
				}

				// Legacy account reclaims
				if (
					e.module === MODULE.LEGACY &&
					e.name === EVENT.ACCOUNT_RECLAIMED &&
					e.topics[2] === addressFromParams
				) {
					const accountReclaimedEvent = e;
					const legacyAccountReclaimEntries = await getLegacyAccountReclaimEntries(
						addressFromParams,
						accountReclaimedEvent,
						tx,
						block,
					);
					entries.push(...legacyAccountReclaimEntries);
				}

				// PoM transactions
				if (e.module === MODULE.POS && e.name === EVENT.VALIDATOR_PUNISHED) {
					const tokenTransferEvent = sortedEvents
						.concat(otherNecessaryEvents)
						.find(
							event =>
								event.module === MODULE.TOKEN &&
								event.name === EVENT.TRANSFER &&
								event.topics[0].endsWith(tx.id),
						);

					const validatorPunishedEvent = e;
					const pomEntries = await getPomEntries(
						addressFromParams,
						tokenTransferEvent,
						validatorPunishedEvent,
						tx,
						block,
					);
					entries.push(...pomEntries);
				}
			}

			// Shared custodial reward received/sent
			if (e.module === MODULE.POS && e.name === EVENT.REWARDS_ASSIGNED) {
				const rewardAssignedEntries = await getSharedRewardsAssignedEntries(
					addressFromParams,
					e,
					tx,
					block,
				);
				entries.push(...rewardAssignedEntries);
			}
		} else if (lengthTopic0 === LENGTH_DEFAULT_TOPIC) {
			// Handle block rewards starting from token:mint until (dynamic)reward:rewardMinted events
			if (e.module === MODULE.TOKEN && e.name === EVENT.MINT && e.topics[1] === addressFromParams) {
				const tokenMintedEvent = e;
				const nextEvent = sortedEvents[i + 1];
				const tokenLockedEvent =
					nextEvent.module === MODULE.TOKEN &&
					nextEvent.name === EVENT.LOCK &&
					nextEvent.data.address === addressFromParams
						? nextEvent
						: null;

				const block = sortedBlocks.find(b => b.id === e.block.id);

				// Split block generation reward to 2 entries:
				// 	- commission + self-stake reward
				// 	- shared custodial reward (only when validator has received stakes from others)
				const blockRewardEntries = await getBlockRewardEntries(
					addressFromParams,
					tokenMintedEvent,
					tokenLockedEvent,
					block,
				);
				entries.push(...blockRewardEntries);
			}
		} else {
			logger.warn(`Unhandled event encountered:\n${JSON.stringify(e, null, '\t')}`);
		}
	}

	return dropDuplicatesDeep(entries);
};

const rescheduleExportOnTimeout = async params => {
	try {
		const currentChainID = await getCurrentChainID();
		const excelFilename = await getExcelFilenameFromParams(params, currentChainID);

		// Clear the flag to allow proper execution on user request if auto re-scheduling fails
		await jobScheduledCache.delete(excelFilename);

		const { address } = params;
		const requestInterval = await standardizeIntervalFromParams(params);
		logger.info(`Original job timed out. Rescheduling job for ${address} (${requestInterval}).`);

		// eslint-disable-next-line no-use-before-define
		await scheduleTransactionExportQueue.add({ params, isRescheduled: true });
	} catch (err) {
		logger.warn(`History export job rescheduling failed due to: ${err.message}`);
		logger.debug(err.stack);
	}
};

const exportTransactions = async job => {
	let timeout;
	const allEntriesForInterval = [];

	const { params, isRescheduled } = job.data;

	// Validate if account has transactions or is a generator
	const isAccountHasTransactions = await checkIfAccountHasTransactions(params.address);
	const isAccountValidator = await checkIfAccountIsValidator(params.address);
	if (isAccountHasTransactions || isAccountValidator) {
		const interval = await standardizeIntervalFromParams(params);
		// Add a timeout to automatically re-schedule, if the current job times out on its last attempt
		// Reschedule only once if all the current retries fail. Failsafe to avoid redundant scheduling and memory leaks
		if (!isRescheduled && job.attemptsMade === job.opts.attempts - 1) {
			const rescheduleAfterMs =
				config.queue.scheduleTransactionExport.options.defaultJobOptions.timeout;
			timeout = setTimeout(rescheduleExportOnTimeout.bind(null, params), rescheduleAfterMs);
			logger.info(
				`Set timeout to auto-reschedule export for ${params.address} (${interval}) in ${rescheduleAfterMs}ms.`,
			);
		}

		const [from, to] = interval.split(':');
		const range = moment.range(moment(from, DATE_FORMAT), moment(to, DATE_FORMAT));
		const arrayOfDates = Array.from(range.by('day')).map(d => d.format(DATE_FORMAT));

		// eslint-disable-next-line no-restricted-syntax
		for (const day of arrayOfDates) {
			const partialFilename = await getPartialFilenameFromParams(params, day);

			/* eslint-disable no-continue */
			// No history available for the specified day
			if ((await noHistoryCache.get(partialFilename)) === true) {
				continue;
			}

			// History available as a partial file for the specified day
			if (await partials.fileExists(partialFilename)) {
				const entriesForDay = JSON.parse(await partials.read(partialFilename));
				allEntriesForInterval.push(...entriesForDay);
				continue;
			}
			/* eslint-enable no-continue */

			// Query for history and build the partial for the day
			const fromTimestamp = moment(day, DATE_FORMAT).startOf('day').unix();
			const toTimestamp = moment(day, DATE_FORMAT).endOf('day').unix();
			const timestampRange = `${fromTimestamp}:${toTimestamp}`;

			// Fetch all the related blocks, transactions and events for the day
			const timeBoxedParams = { ...params, timestamp: timestampRange };
			const sortedBlocks = await getAllBlocksInAsc(timeBoxedParams);
			const sortedTransactions = await getAllTransactionsInAsc(timeBoxedParams);
			const sortedEvents = await getAllEventsInAsc({
				topic: timeBoxedParams.address,
				timestamp: timeBoxedParams.timestamp,
			});
			const entriesForDay = await getEntriesByChronology(
				timeBoxedParams,
				sortedBlocks,
				sortedTransactions,
				sortedEvents,
			);

			if (day !== getToday()) {
				if (entriesForDay.length) {
					partials.write(partialFilename, JSON.stringify(entriesForDay));
				} else {
					// Flag to prevent unnecessary calls to the node/file cache
					const RETENTION_PERIOD_MS = getDaysInMilliseconds(config.cache.partials.retentionInDays);
					await noHistoryCache.set(partialFilename, true, RETENTION_PERIOD_MS);
				}
			}

			allEntriesForInterval.push(...entriesForDay);
		}
	}

	// Create the workbook
	const workBook = new excelJS.Workbook();

	// Build the account history sheet
	const transactionExportSheet = workBook.addWorksheet(config.excel.sheets.TRANSACTION_HISTORY);
	transactionExportSheet.columns = fields.transactionMappings;
	transactionExportSheet.addRows(allEntriesForInterval);

	// Build the metadata sheet
	const currentChainID = await getCurrentChainID();
	const uniqueChainIDs = await getUniqueChainIDs(allEntriesForInterval);
	const metadataEntriesList = await Promise.all(
		uniqueChainIDs.map(async chainID => getMetadataEntries(params, chainID, currentChainID)),
	);
	const metadataEntries = metadataEntriesList.flat();
	const metadataSheet = workBook.addWorksheet(config.excel.sheets.METADATA);
	metadataSheet.columns = fields.metadataMappings;
	metadataSheet.addRows(metadataEntries);

	const excelFilename = await getExcelFilenameFromParams(params, currentChainID);
	await workBook.xlsx.writeFile(`${config.cache.exports.dirPath}/${excelFilename}`);
	logger.info(`Successfully exported the account transaction history to: ${excelFilename}.`);
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

	try {
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
		logger.debug(
			`Attempting to schedule transaction history export for ${address} (${requestInterval}).`,
		);
		await scheduleTransactionExportQueue.add({ params: { ...params, address } });
		logger.info(
			`Successfully scheduled transaction history export for ${address} (${requestInterval}).`,
		);
		exportResponse.status = 'ACCEPTED';

		const ttl = config.queue.scheduleTransactionExport.options.defaultJobOptions.timeout * 2;
		await jobScheduledCache.set(excelFilename, true, ttl);

		return exportResponse;
	} catch (err) {
		if (err instanceof ValidationException) throw err;

		const errMessage = `Unable to schedule transaction history export for ${address} (${requestInterval}) due to: ${err.message}`;
		logger.warn(errMessage);
		logger.debug(err.stack);
		throw new Error(errMessage);
	}
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
	formatTransaction,
	formatBlocks,
	getChainInfo,
	getBlockRewardEntries,
	getGeneratorFeeEntries,
	getSharedRewardsAssignedEntries,
	getMessageFeeEntries,
	getOutgoingTransferCCEntries,
	getIncomingTransferCCEntries,
	getLegacyAccountReclaimEntries,
	getPomEntries,
};
