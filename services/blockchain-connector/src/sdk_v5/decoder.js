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
// Remove from here -- added to avoid cyclic dependency on actions.js
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

const getBlockHeaderAssetSchema = async (blockHeaderVersion) => {
	const allSchemas = await getSchema();
	const { blockHeadersAssets } = allSchemas;
	return blockHeadersAssets[blockHeaderVersion];
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

const decodeAccount = async (encodedAccount) => {
	const accountSchema = await getAccountSchema();
	const accountBuffer = Buffer.isBuffer(encodedAccount)
		? encodedAccount
		: Buffer.from(encodedAccount, 'hex');
	const decodedAccount = codec.decode(accountSchema, accountBuffer);
	return decodedAccount;
};

const decodeBlock = async (encodedBlock) => {
	const blockSchema = await getBlockSchema();
	const blockBuffer = Buffer.isBuffer(encodedBlock)
		? encodedBlock
		: Buffer.from(encodedBlock, 'hex');
	const block = codec.decode(blockSchema, blockBuffer);

	const blockHeaderSchema = await getBlockHeaderSchema();
	const blockHeader = codec.decode(blockHeaderSchema, block.header);

	const isGenesisBlock = (await getGenesisHeight()) === blockHeader.height;
	const blockHeadersAssetsSchema = await getBlockHeaderAssetSchema(blockHeader.version);
	const blockHeaderAsset = codec.decode(blockHeadersAssetsSchema, blockHeader.asset);
	if (isGenesisBlock) {
		// Test genesis block
		blockHeaderAsset.accounts = await Promise.all(
			blockHeaderAsset.accounts.map(acc => decodeAccount(acc)),
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

const decodeTransaction = async (encodedTransaction) => {
	const txSchema = await getTransactionSchema();
	const transactionBuffer = Buffer.isBuffer(encodedTransaction)
		? encodedTransaction
		: Buffer.from(encodedTransaction, 'hex');
	const transaction = codec.decode(txSchema, transactionBuffer);

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
