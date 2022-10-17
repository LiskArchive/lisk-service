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

let allSchemas;

const getSchemasFromNode = async () => {
	const systemMetadata = await requestConnector('getSystemMetadata');
	const schemas = await requestConnector('getSchema');
	return { schemas, systemMetadata };
};

const getAllSchemas = async () => {
	if (!allSchemas) {
		const schemas = await getSchemasFromNode();

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

		allSchemas = {};
		Object.entries(schemas.schemas).forEach(([entity, schema]) => allSchemas[entity] = { schema });

		Object.assign(allSchemas, {
			assets: assetsSchemas,
			commands: commandsParamsSchemas,
			events: eventsSchemas,
		});
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
