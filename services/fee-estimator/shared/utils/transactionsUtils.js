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
const allCommandsParamsSchemasForFeesCache = [];

const getCommandsParamsSchemasFromApp = async () => {
	const schemas = await requestConnector('getSystemMetadata');
	return schemas;
};

const getAllCommandsParamsSchemas = async () => {
	if (!allCommandsParamsSchemasFromAppCache) {
		allCommandsParamsSchemasFromAppCache = await getCommandsParamsSchemasFromApp();
	}
	return allCommandsParamsSchemasFromAppCache;
};

const getTxnParamsSchema = async (trx) => {
	const moduleCommand = String(trx.module).concat(':').concat(trx.command);
	const response = await getAllCommandsParamsSchemas();

	if (!allCommandsParamsSchemasForFeesCache.length) {
		response.modules.forEach(module => {
			module.commands.forEach(command => {
				const formattedTxParams = {};
				formattedTxParams.moduleCommand = String(module.name).concat(':').concat(command.name);
				formattedTxParams.schema = command.params;
				allCommandsParamsSchemasForFeesCache.push(formattedTxParams);
			});
		});
	}
	const [{ schema }] = allCommandsParamsSchemasForFeesCache.filter(
		txSchema => (!moduleCommand)
			|| txSchema.moduleCommand === moduleCommand,
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
