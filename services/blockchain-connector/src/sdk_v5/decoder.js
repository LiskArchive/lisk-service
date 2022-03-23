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
const { codec } = require('@liskhq/lisk-codec');
const { getApiClient } = require('./client');
// const { getSchema, getNodeInfo } = require('./actions');


// ================================================================================================
// Remove from here
// ================================================================================================

// Constants
const timeoutMessage = 'Response not received in';
const NUM_REQUEST_RETRIES = 5;
let schema;

// eslint-disable-next-line consistent-return
const invokeAction = async (action, params = {}, numRetries = NUM_REQUEST_RETRIES) => {
	const apiClient = await getApiClient();
	let retries = numRetries;
	do {
		/* eslint-disable no-await-in-loop */
		try {
			const response = await apiClient._channel.invoke(action, params);
			return response;
		} catch (err) {
			if (retries && err instanceof TimeoutException) await delay(10);
			else throw err;
		}
		/* eslint-enable no-await-in-loop */
	} while (retries--);
};

const getSchema = async () => {
	try {
		if (!schema) {
			schema = await invokeAction('app:getSchema');
		}
		return schema;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getSchema\'');
		}
		throw err;
	}
};

const getNodeInfo = async () => {
	try {
		const nodeInfo = await invokeAction('app:getNodeInfo');
		return nodeInfo;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getNodeInfo\'');
		}
		throw err;
	}
};

// ================================================================================================
// Remove until here
// ================================================================================================

let genesisHeight;

const getGenesisHeight = async () => {
	if (!genesisHeight) {
		const nodeInfo = await getNodeInfo();
		genesisHeight = nodeInfo.genesisHeight;
	}
	return genesisHeight;
};

const getAccountSchema = async () => {
	const allSchemas = await getSchema();
	return allSchemas.account;
};

const getBlockSchema = async () => {
	const allSchemas = await getSchema();
	return allSchemas.block;
};

const getBlockHeaderSchema = async () => {
	const allSchemas = await getSchema();
	return allSchemas.blockHeader;
};

const getBlockHeaderAssetSchema = async (isGenesisBlock = false) => {
	const allSchemas = await getSchema();
	const { blockHeadersAssets } = allSchemas;
	const blockHeaderAssetSchema = isGenesisBlock
		? blockHeadersAssets[0]
		: blockHeadersAssets[2];
	return blockHeaderAssetSchema;
};

const getTransactionSchema = async () => {
	const allSchemas = await getSchema();
	return allSchemas.transaction;
};

const getTransactionAssetSchema = async (transaction) => {
	const allSchemas = await getSchema();
	const transactionAssetSchemas = allSchemas.transactionsAssets;
	const { schema } = transactionAssetSchemas.find(schema =>
		schema.moduleID === transaction.moduleID
		&& schema.assetID === transaction.assetID,
	);
	return schema;
};

const decodeAccount = async (encodedAccount, isBinaryEncoded = false) => {
	const accountSchema = await getAccountSchema();
	const accountBinary = isBinaryEncoded ? encodedAccount : Buffer.from(encodedAccount, 'hex');
	const decodedAccount = codec.decode(accountSchema, accountBinary);
	return decodedAccount;
};

const decodeBlock = async (hexEncodedBlock) => {
	const blockSchema = await getBlockSchema();
	const blockBinary = Buffer.from(hexEncodedBlock, 'hex');
	const block = codec.decode(blockSchema, blockBinary);

	const blockHeaderSchema = await getBlockHeaderSchema();
	const blockHeader = codec.decode(blockHeaderSchema, block.header);

	const isGenesisBlock = (await getGenesisHeight()) === blockHeader.height;
	const blockHeadersAssetsSchema = await getBlockHeaderAssetSchema(isGenesisBlock);
	const blockHeaderAsset = codec.decode(blockHeadersAssetsSchema, blockHeader.asset);
	if (isGenesisBlock) {
		// Test genesis block
		blockHeaderAsset.accounts = await Promise.all(
			blockHeaderAsset.accounts.map(acc => decodeAccount(acc, true)),
		);
	}

	const blockPayload = await Promise.all(block.payload.map(tx => decodeTransaction(tx)));

	const decodedBlock = {
		header: {
			...blockHeader,
			asset: blockHeaderAsset,
		},
		payload: blockPayload,
	};
	return decodedBlock;
};

const decodeTransaction = async (hexEncodedTransaction) => {
	const txSchema = await getTransactionSchema();
	const transactionBinary = Buffer.from(hexEncodedTransaction, 'hex');
	const transaction = codec.decode(txSchema, transactionBinary);

	const txAssetSchema = await getTransactionAssetSchema(transaction);
	const transactionAsset = codec.decode(txAssetSchema, transaction.asset);

	const decodedTransaction = {
		...transaction,
		asset: transactionAsset,
	};

	return decodedTransaction;
};

module.exports = {
	decodeAccount,
	decodeBlock,
	decodeTransaction,
};
