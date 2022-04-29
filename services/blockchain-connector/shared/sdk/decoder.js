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

const { codec } = require('@liskhq/lisk-codec');
const { hash } = require('@liskhq/lisk-cryptography');

const {
	getAccountSchema,
	getBlockSchema,
	getBlockHeaderSchema,
	getBlockAssetSchema,
	getTransactionSchema,
	getTransactionParamsSchema,
} = require('./schema');

const { parseToJSONCompatObj } = require('../parser');

const decodeAccount = async (encodedAccount) => {
	const accountSchema = await getAccountSchema();
	const accountBuffer = Buffer.isBuffer(encodedAccount)
		? encodedAccount
		: Buffer.from(encodedAccount, 'hex');
	const decodedAccount = codec.decode(accountSchema, accountBuffer);
	return decodedAccount;
};

const decodeTransaction = async (encodedTransaction) => {
	const txSchema = await getTransactionSchema();
	const transactionBuffer = Buffer.isBuffer(encodedTransaction)
		? encodedTransaction
		: Buffer.from(encodedTransaction, 'hex');
	const transaction = codec.decode(txSchema, transactionBuffer);
	transaction.id = hash(transactionBuffer);
	transaction.size = transactionBuffer.length;

	const txParamsSchema = await getTransactionParamsSchema(transaction);
	const transactionParams = codec.decode(txParamsSchema, transaction.params);

	const decodedTransaction = {
		...transaction,
		params: transactionParams,
	};

	return decodedTransaction;
};

const decodeBlock = async (encodedBlock) => {
	const blockSchema = await getBlockSchema();
	const blockBuffer = Buffer.isBuffer(encodedBlock)
		? encodedBlock
		: Buffer.from(encodedBlock, 'hex');
	const block = codec.decode(blockSchema, blockBuffer);

	const blockHeaderSchema = await getBlockHeaderSchema();
	const blockHeader = codec.decode(blockHeaderSchema, block.header);
	blockHeader.id = hash(block.header);

	const blockAssetSchema = await getBlockAssetSchema();
	const blockAssets = await Promise
		.all(block.assets.map(asset => codec.decode(blockAssetSchema, asset)));

	const blockTransactions = await Promise.all(block.transactions.map(tx => decodeTransaction(tx)));

	const decodedBlock = {
		header: blockHeader,
		assets: blockAssets,
		transactions: blockTransactions,
	};
	return decodedBlock;
};

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

const decodeEventPayload = async (eventName, payload) => {
	if (['app_newBlock', 'app_deleteBlock', 'app_chainForked'].includes(eventName)) {
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
	decodeAccount,
	decodeBlock,
	decodeTransaction,
	decodeResponse,
	decodeEventPayload,
};
