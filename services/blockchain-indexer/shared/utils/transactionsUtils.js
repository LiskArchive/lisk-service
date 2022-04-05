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

const { getGenesisConfig } = require('../constants');
const { getTransactionsSchemas } = require('../indexer/transactionsSchemas');

const getTxnAssetSchema = async (trx) => {
	const moduleAssetId = String(trx.moduleID).concat(':').concat(trx.assetID);
	const { data: [{ schema }] } = await getTransactionsSchemas({ moduleAssetId });
	return schema;
};

const getTxnMinFee = async (
	txn,
	getTxnAssetSchemaFn = getTxnAssetSchema,
	getGenesisConfigFn = getGenesisConfig,
) => computeMinFee(
	await getTxnAssetSchemaFn(txn),
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
};
