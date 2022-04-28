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
const { decodeBlock, decodeTransaction } = require('./decoder');
const { parseToJSONCompatObj } = require('../parser');

const decodeResponse = async (action, response) => {
	if (['app_getBlockByHeight', 'app_getBlockByID', 'app_getLastBlock'].includes(action)) {
		const decodedBlock = await decodeBlock(response);
		return parseToJSONCompatObj(decodedBlock);
	}

	if (['app_getBlocksByHeightBetween', 'app_getBlocksByIDs'].includes(action)) {
		return BluebirdPromise.map(
			response,
			async block => {
				const decodedBlock = await decodeBlock(block);
				return parseToJSONCompatObj(decodedBlock);
			}, { concurrency: response.length });
	}

	if (['app_getTransactionByID'].includes(action)) {
		const decodedTransaction = await decodeTransaction(response);
		return parseToJSONCompatObj(decodedTransaction);
	}

	if (['getTransactionsByIDs', 'getTransactionsFromPool'].includes(action)) {
		return BluebirdPromise.map(
			response,
			async transaction => {
				const decodedTransaction = await decodeTransaction(transaction);
				return parseToJSONCompatObj(decodedTransaction);
			}, { concurrency: response.length });
	}
	return response;
};

const decodeEventResponse = async (eventName, payload) => {
	if (['app_newBlock', 'app_deleteBlock', 'appChainFork'].includes(eventName)) {
		const decodedBlock = await decodeBlock(payload.block);
		return parseToJSONCompatObj(decodedBlock);
	}

	if (eventName === 'app_newTransaction') {
		const decodedTransaction = await decodeTransaction(payload.transaction);
		return parseToJSONCompatObj(decodedTransaction);
	}

	return payload;
};

module.exports = {
	decodeResponse,
	decodeEventResponse,
};
