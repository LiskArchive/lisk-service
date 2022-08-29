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

const { parseInputBySchema } = require('../utils/parser');
const {
	getBlockSchema,
	getBlockHeaderSchema,
	getBlockAssetSchema,
	getTransactionSchema,
	getTransactionParamsSchema,
} = require('./schema');

const encodeTransaction = (transaction) => {
	const txParamsSchema = getTransactionParamsSchema(transaction);
	const parsedTxParams = parseInputBySchema(transaction.params, txParamsSchema);
	const txParamsBuffer = codec.encode(txParamsSchema, parsedTxParams);

	const txSchema = getTransactionSchema();
	const parsedTx = parseInputBySchema(transaction, txSchema);

	const txBuffer = codec.encode(
		txSchema,
		{ ...parsedTx, params: txParamsBuffer },
	);

	return txBuffer.toString('hex');
};

const encodeBlock = (block) => {
	const { header, assets, transactions } = block;

	// Handle the block transactions
	const blockTransactionsBuffer = transactions.map(tx => encodeTransaction(tx));

	// Handle the block assets
	const blockAssetSchema = getBlockAssetSchema();
	const parsedAssets = assets.map(asset => parseInputBySchema(asset, blockAssetSchema));
	const blockAssetBuffer = parsedAssets.map(asset => codec.encode(blockAssetSchema, asset));

	// Handle the block header
	const blockHeaderSchema = getBlockHeaderSchema();
	const parsedBlockHeader = parseInputBySchema(header, blockHeaderSchema);
	const blockHeaderBuffer = codec.encode(blockHeaderSchema, parsedBlockHeader);

	const blockSchema = getBlockSchema();

	const parsedBlock = parseInputBySchema({
		header: blockHeaderBuffer,
		assets: blockAssetBuffer,
		transactions: blockTransactionsBuffer,
	}, blockSchema);

	const blockBuffer = codec.encode(blockSchema, parsedBlock);

	return blockBuffer.toString('hex');
};

module.exports = {
	encodeBlock,
	encodeTransaction,
};
