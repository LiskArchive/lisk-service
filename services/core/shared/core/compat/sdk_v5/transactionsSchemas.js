/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const coreApi = require('./coreApi');

const requestApi = coreApi.requestRetry;

const getTransactionsSchemas = async params => {
	const transactionsSchemas = {
		data: [],
		meta: {},
	};

	const response = await requestApi(coreApi.getTransactionsSchemas);

	const allTransactionSchemas = response.transactionsAssets.map(txAsset => {
		const formattedTxAsset = {};
		formattedTxAsset.moduleAssetId = String(txAsset.moduleID).concat(':').concat(txAsset.assetID);
		formattedTxAsset.moduleAssetName = String(txAsset.moduleName).concat(':').concat(txAsset.assetName);
		formattedTxAsset.schema = txAsset.schema;
		return formattedTxAsset;
	});

	const { moduleAssetId, moduleAssetName } = params;

	transactionsSchemas.data = allTransactionSchemas.filter(
		txSchema => (!moduleAssetId && !moduleAssetName)
			|| txSchema.moduleAssetId === moduleAssetId
			|| txSchema.moduleAssetName === moduleAssetName,
	);

	transactionsSchemas.meta = {
		count: transactionsSchemas.data.length,
		offset: 0,
		total: allTransactionSchemas.length,
	};

	return transactionsSchemas;
};

module.exports = {
	getTransactionsSchemas,
};
