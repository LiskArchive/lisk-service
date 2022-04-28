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

const {
	getAccountSchema,
	getBlockSchema,
	getBlockHeaderSchema,
	getBlockHeaderAssetSchema,
	getTransactionSchema,
	getTransactionParamsSchema,
} = require('./schema');

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

	// const blockHeaderAssetSchema = await getBlockHeaderAssetSchema(blockHeader.version);
	// const blockHeaderAsset = codec.decode(blockHeaderAssetSchema, blockHeader.asset);
	// if (Array.isArray(blockHeader.asset.accounts)) {
	// 	blockHeaderAsset.accounts = await Promise.all(
	// 		blockHeaderAsset.accounts.map(acc => decodeAccount(acc)),
	// 	);
	// }

	const blockPayload = await Promise.all(block.transactions.map(tx => decodeTransaction(tx)));

	const decodedBlock = {
		header: blockHeader,
		asset: block.assets,
		transactions: blockPayload,
	};
	return decodedBlock;
};

module.exports = {
	decodeAccount,
	decodeBlock,
	decodeTransaction,
};
