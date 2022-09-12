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
	const registeredModules = systemMetadata.modules.map(m => m.name);
	const availableModuleProcessors = await getAvailableModuleProcessors();

	const promises = availableModuleProcessors.map(async (moduleNameVal) => {
		const { index, ...availableCommandProcessors } = await getCommandProcessors(moduleNameVal);
		const { moduleName } = index;

		if (registeredModules.includes(moduleName)) {
			if (!moduleProcessorMap.has(moduleName)) moduleProcessorMap.set(moduleName, new Map());

			const moduleCommandProcessorMap = moduleProcessorMap.get(moduleName);
			Object.values(availableCommandProcessors)
				.forEach(e => {
					moduleCommandProcessorMap.set(`apply_${e.commandName}`, e.applyTransaction);
					moduleCommandProcessorMap.set(`revert_${e.commandName}`, e.revertTransaction);
				});
		}
	});

	return Promise.all(promises);
};

const applyTransaction = async (blockHeader, tx, dbTrx) => {
	if (moduleProcessorMap.size === 0) await buildModuleCommandProcessorMap();

	if (!moduleProcessorMap.has(tx.module)) throw Error(`No processors implemented for transactions related to module: ${tx.module}`);
	const moduleCommandProcessorMap = moduleProcessorMap.get(tx.module);

	if (!moduleCommandProcessorMap.has(`apply_${tx.command}`)) throw Error(`No applyTransaction hook implemented for transactions with module: ${tx.module} and command: ${tx.command}`);
	const transactionProcessor = moduleCommandProcessorMap.get(`apply_${tx.command}`);

	return transactionProcessor(blockHeader, tx, dbTrx);
};

const revertTransaction = async (blockHeader, tx, dbTrx) => {
	if (moduleProcessorMap.size === 0) await buildModuleCommandProcessorMap();

	if (!moduleProcessorMap.has(tx.module)) throw Error(`No processors implemented for transactions related to module: ${tx.module}`);
	const moduleCommandProcessorMap = moduleProcessorMap.get(tx.module);

	if (!moduleCommandProcessorMap.has(`revert_${tx.command}`)) throw Error(`No revertTransaction hook implemented for transactions with module: ${tx.module} and command: ${tx.command}`);
	const transactionProcessor = moduleCommandProcessorMap.get(`revert_${tx.command}`);

	return transactionProcessor(blockHeader, tx, dbTrx);
};

module.exports = {
	applyTransaction,
	revertTransaction,
};
