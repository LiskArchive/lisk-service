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

const { parseInputBySchema } = require('../parser');
const {
	getBlockSchema,
	getBlockHeaderSchema,
	getBlockAssetSchema,
	getTransactionSchema,
	getTransactionParamsSchema,
} = require('./schema');

const encodeTransaction = async (transaction) => {
	const txParamsSchema = await getTransactionParamsSchema(transaction);
	const txParamsBuffer = codec.encode(txParamsSchema, transaction.asset);

	const txSchema = await getTransactionSchema();
	const txBuffer = codec.encode(
		txSchema,
		{ ...transaction, params: txParamsBuffer },
	);

	return txBuffer.toString('hex');
};

const encodeBlock = async (block) => {
	const { header, assets, transactions } = block;

	// Handle the block transactions
	const blockTransactionsBuffer = await Promise.all(transactions.map(tx => encodeTransaction(tx)));

	// Handle the block assets
	const blockAssetSchema = await getBlockAssetSchema();
	const parsedAssets = await Promise
		.all(assets.map(asset => parseInputBySchema(asset, blockAssetSchema)));
	const blockAssetBuffer = await Promise
		.all(parsedAssets.map(asset => codec.encode(blockAssetSchema, asset)));

	// Handle the block header
	const blockHeaderSchema = await getBlockHeaderSchema();
	const blockHeaderBuffer = codec.encode(
		blockHeaderSchema,
		{
			...header,
			previousBlockID: Buffer.from(header.previousBlockID, 'hex'),
			transactionRoot: Buffer.from(header.transactionRoot, 'hex'),
			generatorAddress: Buffer.from(header.generatorAddress, 'hex'),
			assetsRoot: Buffer.from(header.assetsRoot, 'hex'),
			stateRoot: Buffer.from(header.stateRoot, 'hex'),
			validatorsHash: Buffer.from(header.validatorsHash, 'hex'),
			signature: Buffer.from(header.signature, 'hex'),
		},
	);

	const blockSchema = await getBlockSchema();
	const blockBuffer = codec.encode(
		blockSchema,
		{
			header: blockHeaderBuffer,
			assets: blockAssetBuffer,
			transactions: blockTransactionsBuffer,
		},
	);

	return blockBuffer.toString('hex');
};

module.exports = {
	encodeBlock,
	encodeTransaction,
};
