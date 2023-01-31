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
const { getRegisteredModules, MODULE } = require('../../constants');
const { requestConnector } = require('../../utils/request');

let allSchemas;

const getAuthMultiSigRegMsgSchema = async () => {
	const registeredModules = await getRegisteredModules();
	const isAuthModuleRegistered = registeredModules.includes(MODULE.AUTH);

	if (isAuthModuleRegistered) {
		const authMultiSigRegMsgSchema = await requestConnector('getAuthMultiSigRegMsgSchema');
		return {
			moduleCommand: `${MODULE.AUTH}:registerMultisignature`,
			param: 'signatures',
			...authMultiSigRegMsgSchema, // schema
		};
	}
	return null;
};

const getSchemasFromNode = async () => {
	const systemMetadata = await requestConnector('getSystemMetadata');
	const schemas = await requestConnector('getSchema');
	const messageSchemas = [];

	const authMultiSigRegMsgSchema = await getAuthMultiSigRegMsgSchema();
	if (authMultiSigRegMsgSchema) messageSchemas.push(authMultiSigRegMsgSchema);

	return { schemas, systemMetadata, messageSchemas };
};

const getAllSchemas = async () => {
	if (!allSchemas) {
		allSchemas = {};
		const schemas = await getSchemasFromNode();

		// Process systemMetadata schemas
		const commandsParamsSchemas = [];
		const assetsSchemas = [];
		const eventsSchemas = [];
		schemas.systemMetadata.modules.forEach(module => {
			module.events.forEach(event => {
				const formattedEvents = {
					module: module.name,
					name: event.name,
					schema: event.data,
				};
				eventsSchemas.push(formattedEvents);
			});

			module.assets.forEach(asset => {
				const formattedAssets = {
					module: module.name,
					version: asset.version,
					schema: asset.data,
				};
				assetsSchemas.push(formattedAssets);
			});

			module.commands.forEach(command => {
				const formattedTxParams = {
					moduleCommand: String(module.name).concat(':', command.name),
					schema: command.params,
				};
				commandsParamsSchemas.push(formattedTxParams);
			});
		});
		Object.assign(allSchemas, {
			assets: assetsSchemas,
			commands: commandsParamsSchemas,
			events: eventsSchemas,
		});

		// Assign generic schemas
		Object.entries(schemas.schemas).forEach(([entity, schema]) => allSchemas[entity] = { schema });

		// Assign messages schemas
		Object.assign(allSchemas, { messages: schemas.messageSchemas });
	}

	return allSchemas;
};

const getSchemas = async () => {
	const schemas = {
		data: {},
		meta: {},
	};

	const response = await getAllSchemas();
	if (response) schemas.data = response;

	return schemas;
};

module.exports = {
	getSchemas,
};
