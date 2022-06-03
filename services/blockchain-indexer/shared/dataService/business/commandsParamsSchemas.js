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
const { requestConnector } = require('../../utils/request');

let allCommandsParamsSchemasCache;

const getCommandsParamsSchemasFromCore = async () => {
	const schemas = await requestConnector('getSchema');
	return schemas;
};

const getAllCommandsParamsSchemasFromCache = async () => {
	if (!allCommandsParamsSchemasCache) {
		allCommandsParamsSchemasCache = await getCommandsParamsSchemasFromCore();
	}
	return allCommandsParamsSchemasCache;
};

const getCommandsParamsSchemas = async params => {
	const commandsParamsSchemas = {
		data: [],
		meta: {},
	};

	const response = await getAllCommandsParamsSchemasFromCache();

	const allCommandsParamsSchemas = response.commands.map(txParams => {
		const formattedTxParams = {};
		formattedTxParams.moduleCommandID = String(txParams.moduleID).concat(':').concat(txParams.commandID);
		formattedTxParams.moduleCommandName = String(txParams.moduleName).concat(':').concat(txParams.commandName);
		formattedTxParams.schema = txParams.schema;
		return formattedTxParams;
	});

	const { moduleCommandID, moduleCommandName } = params;

	commandsParamsSchemas.data = allCommandsParamsSchemas.filter(
		txSchema => (!moduleCommandID && !moduleCommandName)
			|| txSchema.moduleCommandID === moduleCommandID
			|| txSchema.moduleCommandName === moduleCommandName,
	);

	commandsParamsSchemas.meta = {
		count: commandsParamsSchemas.data.length,
		offset: 0,
		total: allCommandsParamsSchemas.length,
	};

	return commandsParamsSchemas;
};

module.exports = {
	getCommandsParamsSchemas,
};
