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

const { requestConnector } = require('./request');
const { getGenesisConfig } = require('../networkConstants');

let allCommandsParamsSchemasFromAppCache;
let allCommandsParamsSchemasForFeesCache;

const getCommandsParamsSchemasFromApp = async () => {
	const schemas = await requestConnector('getSchema');
	return schemas;
};

const getAllCommandsParamsSchemas = async () => {
	if (!allCommandsParamsSchemasFromAppCache) {
		allCommandsParamsSchemasFromAppCache = await getCommandsParamsSchemasFromApp();
	}
	return allCommandsParamsSchemasFromAppCache;
};

const getTxnParamsSchema = async (trx) => {
	const moduleCommandID = String(trx.moduleID).concat(':').concat(trx.commandID);
	const response = await getAllCommandsParamsSchemas();

	if (!allCommandsParamsSchemasForFeesCache) {
		allCommandsParamsSchemasForFeesCache = response.commands.map(txParams => {
			const formattedTxParams = {};
			formattedTxParams.moduleCommandID = String(txParams.moduleID).concat(':').concat(txParams.commandID);
			formattedTxParams.moduleCommandName = String(txParams.moduleName).concat(':').concat(txParams.commandName);
			formattedTxParams.schema = txParams.schema;
			return formattedTxParams;
		});
	}

	const [{ schema }] = allCommandsParamsSchemasForFeesCache.filter(
		txSchema => (!moduleCommandID)
			|| txSchema.moduleCommandID === moduleCommandID,
	);
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

module.exports = {
	getTxnMinFee,
	getAllCommandsParamsSchemas,
};
