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
	getAccountSchema,
	getBlockSchema,
	getBlockHeaderSchema,
	getBlockHeaderAssetSchema,
	getTransactionSchema,
	getTransactionAssetSchema,
} = require('./schema');

const encodeAccount = async (account) => {
	const accountSchema = await getAccountSchema();
	const accountBuffer = codec.encode(accountSchema, account);
	return accountBuffer.toString('hex');
};

const encodeTransaction = async (transaction) => {
	const txAssetSchema = await getTransactionAssetSchema(transaction);
	const txAssetBuffer = codec.encode(txAssetSchema, transaction.asset);

	const txSchema = await getTransactionSchema();
	const txBuffer = codec.encode(
		txSchema,
		{ ...transaction, asset: txAssetBuffer },
	);

	return txBuffer.toString('hex');
};

const encodeBlock = async (block) => {
	const { header, payload } = block;

	// Handle the block payload
	const blockPayloadBuffer = await Promise.all(payload.map(tx => encodeTransaction(tx)));

	// Handle the block header asset
	const blockHeaderAssetSchema = await getBlockHeaderAssetSchema(header.version);
	const parsedHeaderAsset = parseInputBySchema(header.asset, blockHeaderAssetSchema);
	const blockHeaderAssetBuffer = codec.encode(blockHeaderAssetSchema, parsedHeaderAsset);

	// Handle the block header
	const blockHeaderSchema = await getBlockHeaderSchema();
	const blockHeaderBuffer = codec.encode(
		blockHeaderSchema,
		{
			...header,
			asset: blockHeaderAssetBuffer,
			previousBlockID: Buffer.from(header.previousBlockID, 'hex'),
			transactionRoot: Buffer.from(header.transactionRoot, 'hex'),
			generatorPublicKey: Buffer.from(header.generatorPublicKey, 'hex'),
			signature: Buffer.from(header.signature, 'hex'),
		},
	);

	const blockSchema = await getBlockSchema();
	const blockBuffer = codec.encode(
		blockSchema,
		{
			header: blockHeaderBuffer,
			payload: blockPayloadBuffer,
		},
	);

	return blockBuffer.toString('hex');
};

module.exports = {
	encodeAccount,
	encodeBlock,
	encodeTransaction,
};
