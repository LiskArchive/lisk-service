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
const requireAll = require('require-all');

// Module specific constants
const moduleID = 2;
const moduleName = 'Transfer';

// Stores the transaction processor corresponding the assetID
const assetProcessorMap = new Map();

const getAssetProcessors = async () => requireAll({
	dirname: __dirname,
	excludeDirs: /^\.(git|svn)$/,
	recursive: false,
	filter: (fileName) => {
		const IGNORE_LIST = ['index.js'];
		const isJSFileRegex = new RegExp(/(.+)\.js$/);
		if (isJSFileRegex.test(fileName) && !IGNORE_LIST.includes(fileName)) {
			return fileName;
		}
		return null;
	},
});

const buildAssetProcessorMap = async () => {
	const availableAssetProcessors = await getAssetProcessors();
	Object.values(availableAssetProcessors)
		.forEach(e => assetProcessorMap.set(e.assetID, e.processTransaction));
};

const processTransaction = async (tx) => {
	if (tx.moduleID !== moduleID) throw Error(`${moduleID}`);

	if (!assetProcessorMap.size) await buildAssetProcessorMap();

	const assetProcessor = assetProcessorMap.get(tx.assetID);
	return assetProcessor(tx);
};

module.exports = {
	moduleID,
	moduleName,
	processTransaction,
};
