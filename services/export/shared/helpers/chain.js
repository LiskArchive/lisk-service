/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const { requestAllStandard } = require('./requestAll');
const { MODULE, COMMAND } = require('./constants');
const { getAddressFromParams } = require('./account');
const { requestConnector, requestIndexer } = require('./request');

let networkStatus;
let feeTokenID;
let posTokenID;

const getNetworkStatus = async () => {
	if (!networkStatus) {
		networkStatus = await requestIndexer('network.status');
	}
	return networkStatus;
};

const getCurrentChainID = async () => {
	const status = await getNetworkStatus();
	const { chainID } = status.data;
	return chainID;
};

const resolveReceivingChainID = (tx, currentChainID) =>
	tx.moduleCommand === `${MODULE.TOKEN}:${COMMAND.TRANSFER_CROSS_CHAIN}`
		? tx.params.receivingChainID
		: currentChainID;

const getUniqueChainIDs = async txs => {
	const chainIDs = new Set();
	txs.forEach(tx => {
		if (tx.sendingChainID) chainIDs.add(tx.sendingChainID);
		if (tx.receivingChainID) chainIDs.add(tx.receivingChainID);
	});
	return Array.from(chainIDs);
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

	return {
		sendingChainID: currentChainID,
		receivingChainID: currentChainID,
	};
};

const getBlocks = async params => requestIndexer('blocks', params);

const getTransactions = async params => requestIndexer('transactions', params);

const getEvents = async params =>
	requestIndexer('events', { sort: 'height:asc', order: 'index:asc', ...params });

const getAllBlocksInAsc = async params => {
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
			generatorAddress: getAddressFromParams(params),
			timestamp: params.timestamp,
			sort: 'height:asc',
		},
		totalBlocks,
	);

	return blocks;
};

const getAllTransactionsInAsc = async params => {
	const totalTransactions = (
		await getTransactions({
			address: params.address,
			timestamp: params.timestamp,
			limit: 1,
		})
	).meta.total;

	const transactions = await requestAllStandard(
		getTransactions,
		{
			address: getAddressFromParams(params),
			timestamp: params.timestamp,
			sort: 'height:asc',
			order: 'index:asc',
		},
		totalTransactions,
	);

	return transactions;
};

const getAllEventsInAsc = async params => {
	const totalEvents = (await getEvents({ ...params, limit: 1 })).meta.total;
	const events = await requestAllStandard(getEvents, params, totalEvents);
	return events;
};

const getFeeTokenID = async () => {
	if (!feeTokenID) {
		feeTokenID = await requestConnector('getFeeTokenID');
	}

	return feeTokenID;
};

const getPosTokenID = async () => {
	if (!posTokenID) {
		const posModuleConstants = await requestConnector('getPosConstants');
		posTokenID = posModuleConstants.posTokenID;
	}

	return posTokenID;
};

module.exports = {
	getCurrentChainID,
	resolveReceivingChainID,
	getNetworkStatus,
	getUniqueChainIDs,
	resolveChainIDs,
	getBlocks,
	getTransactions,
	getEvents,
	getAllBlocksInAsc,
	getAllTransactionsInAsc,
	getAllEventsInAsc,
	getFeeTokenID,
	getPosTokenID,
};
