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
	getTransactionAssetSchema,
} = require('./decoder');

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
	const blockPayloadBuffer = await Promise.all(payload.map(tx => encodeTransaction(tx)));

	// TODO: Implement auto-transformer for Buffer/BigInt props based on the schema-object
	if (Array.isArray(header.asset.accounts)) {
		header.asset.initDelegates = header.asset.initDelegates.map(a => Buffer.from(a, 'hex'));
		header.asset.accounts = header.asset.accounts.map(acc => {
			acc.address = Buffer.from(acc.address, 'hex');
			acc.token.balance = BigInt(acc.token.balance);
			acc.sequence.nonce = BigInt(acc.sequence.nonce);
			acc.keys.mandatoryKeys = acc.keys.mandatoryKeys.map(k => Buffer.from(k, 'hex'));
			acc.keys.optionalKeys = acc.keys.optionalKeys.map(k => Buffer.from(k, 'hex'));
			acc.dpos.delegate = {
				...acc.dpos.delegate,
				totalVotesReceived: BigInt(acc.dpos.delegate.totalVotesReceived),
			};
			acc.dpos.sentVotes = acc.dpos.sentVotes.map(v => ({
				...v,
				delegateAddress: Buffer.from(v.delegateAddress, 'hex'),
				amount: BigInt(v.amount),
			}));
			acc.dpos.unlocking = acc.dpos.unlocking.map(u => ({
				...u,
				delegateAddress: Buffer.from(u.delegateAddress, 'hex'),
				amount: BigInt(u.amount),
			}));
			return acc;
		});
	}

	const blockHeaderAssetSchema = await getBlockHeaderAssetSchema(header.version);
	const blockHeaderAssetBuffer = codec.encode(blockHeaderAssetSchema, header.asset);

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
