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
// The keys for the second-level map are commandIDs, values are custom 'applyTransaction' methods
const moduleProcessorMap = new Map();

const getAvailableModuleProcessors = async () => {
	const IGNORE_DIRS = ['0_moduleName'];
	const processors = await getAllDirectories(__dirname);
	return processors.filter(e => !IGNORE_DIRS.includes(e));
};

const getCommandProcessors = async (moduleName) => requireAll({
	dirname: `${__dirname}/${moduleName}`,
	filter: /(.+)\.js$/,
	excludeDirs: /^\.(git|svn)$/,
	recursive: false,
});

const buildModuleCommandProcessorMap = async () => {
	const systemMetadata = await requestConnector('getSystemMetadata');
	const registeredModuleIDs = systemMetadata.modules.map(m => m.id);
	const availableModuleProcessors = await getAvailableModuleProcessors();

	const promises = availableModuleProcessors.map(async (moduleName) => {
		const { index, ...availableCommandProcessors } = await getCommandProcessors(moduleName);
		const { moduleID } = index;

		if (registeredModuleIDs.includes(moduleID)) {
			if (!moduleProcessorMap.has(moduleID)) moduleProcessorMap.set(moduleID, new Map());

			const moduleCommandProcessorMap = moduleProcessorMap.get(moduleID);
			Object.values(availableCommandProcessors)
				.forEach(e => {
					moduleCommandProcessorMap.set(`apply_${e.commandID}`, e.applyTransaction);
					moduleCommandProcessorMap.set(`revert_${e.commandID}`, e.revertTransaction);
				});
		}
	});

	return Promise.all(promises);
};

const applyTransaction = async (blockHeader, tx, dbTrx) => {
	if (moduleProcessorMap.size === 0) await buildModuleCommandProcessorMap();

	if (!moduleProcessorMap.has(tx.moduleID)) throw Error(`No processors implemented for transactions related to moduleID: ${tx.moduleID}`);
	const moduleCommandProcessorMap = moduleProcessorMap.get(tx.moduleID);

	if (!moduleCommandProcessorMap.has(tx.commandID)) throw Error(`No applyTransaction hook implemented for transactions with moduleID: ${tx.moduleID} and commandID: ${tx.commandID}`);
	const transactionProcessor = moduleCommandProcessorMap.get(`apply_${tx.commandID}`);

	return transactionProcessor(blockHeader, tx, dbTrx);
};

const revertTransaction = async (blockHeader, tx, dbTrx) => {
	if (moduleProcessorMap.size === 0) await buildModuleCommandProcessorMap();

	if (!moduleProcessorMap.has(tx.moduleID)) throw Error(`No processors implemented for transactions related to moduleID: ${tx.moduleID}`);
	const moduleCommandProcessorMap = moduleProcessorMap.get(tx.moduleID);

	if (!moduleCommandProcessorMap.has(tx.commandID)) throw Error(`No revertTransaction hook implemented for transactions with moduleID: ${tx.moduleID} and commandID: ${tx.commandID}`);
	const transactionProcessor = moduleCommandProcessorMap.get(`revert_${tx.commandID}`);

	return transactionProcessor(blockHeader, tx, dbTrx);
};

module.exports = {
	applyTransaction,
	revertTransaction,
};
