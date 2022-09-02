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
const { computeMinFee } = require('@liskhq/lisk-transactions');

const { codec } = require('@liskhq/lisk-codec');

const {
	utils: { hash },
} = require('@liskhq/lisk-cryptography');

const {
	getGenesisConfig,
	getSystemMetadata,
} = require('../constants');

const { requestConnector } = require('./request');
const { getLisk32AddressFromHex } = require('./accountUtils');
const { parseInputBySchema, parseToJSONCompatObj } = require('./parser');
const { getCommandsParamsSchemas } = require('../dataService/business/commandsParamsSchemas');

const getTxnParamsSchema = async (trx) => {
	const moduleCommand = trx.module.concat(':').concat(trx.command);
	const { data: [{ schema }] } = await getCommandsParamsSchemas({ moduleCommand });
	return schema;
};

const getTxnMinFee = async (
	txn,
	getTxnParamsSchemaFn = getTxnParamsSchema,
	getGenesisConfigFn = getGenesisConfig,
) => computeMinFee(
	await getTxnParamsSchemaFn(txn),
	txn,
	{
		minFeePerByte: (await getGenesisConfigFn()).minFeePerByte,
		baseFees: (await getGenesisConfigFn()).baseFees,
		numberOfSignatures: txn.signatures.filter(s => s.length).length,
		numberOfEmptySignatures: txn.signatures.filter(s => !s.length).length,
	},
);

const normalizeTransaction = async tx => {
	const metadata = await getSystemMetadata();
	const filteredModule = metadata.modules.find(module => module.name === tx.module);
	const filteredCommand = filteredModule.commands.find(s => s.name === tx.command);

	const { params } = tx;
	const decodedParams = codec.decode(filteredCommand.params, Buffer.from(params, 'hex'));
	const parsedTxParams = parseInputBySchema(decodedParams, filteredCommand.params);

	const schema = await requestConnector('getSchema');
	const parsedTx = parseInputBySchema(tx, schema.transaction);
	const parsedTxWithParams = { ...parsedTx, params: parsedTxParams };

	const txBuffer = codec.encode(
		schema.transaction,
		{ ...parsedTx, params: Buffer.from(params, 'hex') },
	);

	// TODO: Remove when transaction ID is available from SDK
	tx.id = hash(txBuffer).toString('hex');
	tx.minFee = await getTxnMinFee(parsedTxWithParams);
	tx.size = txBuffer.length;
	tx.params = decodedParams;

	tx.moduleCommand = `${tx.module}:${tx.command}`;
	if (tx.params.recipientAddress) {
		tx.params
			.recipientAddress = getLisk32AddressFromHex(tx.params.recipientAddress);
	}
	if (tx.params.votes && tx.params.votes.length) {
		tx.params.votes
			.forEach(vote => vote.delegateAddress = getLisk32AddressFromHex(vote.delegateAddress));
	}

	// TODO: Set execution status from observing the events

	return parseToJSONCompatObj(tx);
};

module.exports = {
	getTxnMinFee,
	normalizeTransaction,
};
