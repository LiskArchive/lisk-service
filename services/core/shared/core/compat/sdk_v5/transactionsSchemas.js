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

let allTransactionSchemas;

const getTransactionsSchemas = async params => {
	const transactionsSchemas = {
		data: [],
		meta: {},
	};

	if (!allTransactionSchemas) {
		const response = await coreApi.getTransactionsSchemas();

		allTransactionSchemas = response.transactionsAssets.map(txAsset => {
			const formattedTxAsset = {};
			formattedTxAsset.moduleAssetId = String(txAsset.moduleID).concat(':').concat(txAsset.assetID);
			formattedTxAsset.moduleAssetName = String(txAsset.moduleName).concat(':').concat(txAsset.assetName);
			formattedTxAsset.schema = txAsset.schema;
			return formattedTxAsset;
		});
	}

	const { moduleAssetId, moduleAssetName } = params;

	if (moduleAssetId || moduleAssetName) {
		transactionsSchemas.data = allTransactionSchemas.filter(
			txSchema => txSchema.moduleAssetId === moduleAssetId
				|| txSchema.moduleAssetName === moduleAssetName,
		);
	} else {
		transactionsSchemas.data = allTransactionSchemas;
	}

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
