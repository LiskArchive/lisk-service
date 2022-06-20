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

const { requestConnector } = require('../../utils/request');
const { getAllDirectories } = require('../../utils/file');

// Is a map of maps, where the first level keys are moduleIDs, value are maps
// The keys for the secon-level map are assetIDs, values are custom 'processTransaction' methods
const moduleProcessorMap = new Map();

const getAvailableModuleProcessors = async () => {
	const IGNORE_DIRS = ['moduleName'];
	const processors = await getAllDirectories(__dirname);
	return processors.filter(e => !IGNORE_DIRS.includes(e));
};

const getAssetProcessors = async (moduleName) => requireAll({
	dirname: `${__dirname}/${moduleName}`,
	filter: /(.+)\.js$/,
	excludeDirs: /^\.(git|svn)$/,
	recursive: false,
});

const buildModuleAssetProcessorMap = async () => {
	const registeredModules = await requestConnector('getRegisteredModules');
	const registeredModuleIDs = registeredModules.map(m => m.id);
	const availableModuleProcessors = await getAvailableModuleProcessors();

	const promises = availableModuleProcessors.map(async (moduleName) => {
		const { index, ...availableAssetProcessors } = await getAssetProcessors(moduleName);
		const { moduleID } = index;

		if (registeredModuleIDs.includes(moduleID)) {
			if (!moduleProcessorMap.has(moduleID)) moduleProcessorMap.set(moduleID, new Map());

			const moduleAssetProcessorMap = moduleProcessorMap.get(moduleID);
			Object.values(availableAssetProcessors)
				.forEach(e => moduleAssetProcessorMap.set(e.assetID, e.processTransaction));
		}
	});

	return Promise.all(promises);
};

const processTransaction = async (blockHeader, tx, dbTrx) => {
	if (moduleProcessorMap.size === 0) await buildModuleAssetProcessorMap();

	if (!moduleProcessorMap.has(tx.moduleID)) throw Error(`No processors implemented for transactions related to moduleID: ${tx.moduleID}`);
	const moduleAssetProcessorMap = moduleProcessorMap.get(tx.moduleID);

	if (!moduleAssetProcessorMap.has(tx.assetID)) throw Error(`No transaction processor implemented for transactions with moduleID: ${tx.moduleID} and assetID: ${tx.assetID}`);
	const transactionProcessor = moduleAssetProcessorMap.get(tx.assetID);

	return transactionProcessor(blockHeader, tx, dbTrx);
};

module.exports = {
	processTransaction,
};
