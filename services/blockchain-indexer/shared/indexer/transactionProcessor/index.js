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

const { Logger } = require('lisk-service-framework');

const { requestConnector } = require('../../utils/request');
const { getAllDirectories } = require('../../utils/file');

const logger = Logger();

// Is a map of maps, where the first level keys are moduleIDs, value are maps
// The keys for the second-level map are commandIDs, values are custom 'applyTransaction' methods
const moduleProcessorMap = new Map();

const getAvailableModuleProcessors = async () => {
	const IGNORE_DIRS = ['0_moduleName'];
	const processors = await getAllDirectories(__dirname);
	return processors.filter(e => !IGNORE_DIRS.includes(e));
};

const getCommandProcessors = async (MODULE_NAME) => requireAll({
	dirname: `${__dirname}/${MODULE_NAME}`,
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
		const { MODULE_NAME } = index;

		if (registeredModules.includes(MODULE_NAME)) {
			if (!moduleProcessorMap.has(MODULE_NAME)) moduleProcessorMap.set(MODULE_NAME, new Map());

			const moduleCommandProcessorMap = moduleProcessorMap.get(MODULE_NAME);
			Object.values(availableCommandProcessors)
				.forEach(e => {
					moduleCommandProcessorMap.set(`apply_${e.COMMAND_NAME}`, e.applyTransaction);
					moduleCommandProcessorMap.set(`revert_${e.COMMAND_NAME}`, e.revertTransaction);
				});
		}
	});

	return Promise.all(promises);
};

const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	if (moduleProcessorMap.size === 0) await buildModuleCommandProcessorMap();

	if (!moduleProcessorMap.has(tx.module)) {
		logger.warn(`No processors implemented for transactions from module: ${tx.module}. Continuing with generic transaction indexing.`);
		return Promise.resolve();
	}
	const moduleCommandProcessorMap = moduleProcessorMap.get(tx.module);

	if (!moduleCommandProcessorMap.has(`apply_${tx.command}`)) {
		logger.warn(`No applyTransaction hook implemented for transaction with moduleCommand: ${tx.module}:${tx.command}. Continuing with generic transaction indexing.`);
		return Promise.resolve();
	}
	const transactionProcessor = moduleCommandProcessorMap.get(`apply_${tx.command}`);

	return transactionProcessor(blockHeader, tx, events, dbTrx);
};

const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	if (moduleProcessorMap.size === 0) await buildModuleCommandProcessorMap();

	if (!moduleProcessorMap.has(tx.module)) {
		logger.warn(`No processors implemented for transactions from module: ${tx.module}. Continuing with removal of the transaction from the index.`);
		return Promise.resolve();
	}
	const moduleCommandProcessorMap = moduleProcessorMap.get(tx.module);

	if (!moduleCommandProcessorMap.has(`revert_${tx.command}`)) {
		logger.warn(`No revertTransaction hook implemented for transactions with moduleCommand: ${tx.module}:${tx.command}. Continuing with removal of the transaction from the index.`);
		return Promise.resolve();
	}
	const transactionProcessor = moduleCommandProcessorMap.get(`revert_${tx.command}`);

	return transactionProcessor(blockHeader, tx, events, dbTrx);
};

module.exports = {
	applyTransaction,
	revertTransaction,
};
