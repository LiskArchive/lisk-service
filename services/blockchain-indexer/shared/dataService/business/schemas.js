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
const { getAuthMultiSigRegMsgSchema } = require('./auth');

let allSchemas;

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
			ccm: {},
		});

		// Assign generic schemas
		Object.entries(schemas.schemas).forEach(([entity, schema]) => allSchemas[entity] = { schema });

		// Assign messages schemas
		Object.assign(allSchemas, { messages: schemas.messageSchemas });

		// Assign ccm schema
		// TODO: Fetch schema from node once this issue is closed https://github.com/LiskHQ/lisk-sdk/issues/8375
		const MIN_MODULE_NAME_LENGTH = 1;
		const MAX_MODULE_NAME_LENGTH = 32;
		const MIN_CROSS_CHAIN_COMMAND_NAME_LENGTH = 1;
		const MAX_CROSS_CHAIN_COMMAND_NAME_LENGTH = 32;
		const CHAIN_ID_LENGTH = 4;
		const ccmSchema = {
			$id: '/modules/interoperability/ccm',
			type: 'object',
			required: [
				'module',
				'crossChainCommand',
				'nonce',
				'fee',
				'sendingChainID',
				'receivingChainID',
				'params',
				'status',
			],
			properties: {
				module: {
					dataType: 'string',
					minLength: MIN_MODULE_NAME_LENGTH,
					maxLength: MAX_MODULE_NAME_LENGTH,
					fieldNumber: 1,
				},
				crossChainCommand: {
					dataType: 'string',
					minLength: MIN_CROSS_CHAIN_COMMAND_NAME_LENGTH,
					maxLength: MAX_CROSS_CHAIN_COMMAND_NAME_LENGTH,
					fieldNumber: 2,
				},
				nonce: {
					dataType: 'uint64',
					fieldNumber: 3,
				},
				fee: {
					dataType: 'uint64',
					fieldNumber: 4,
				},
				sendingChainID: {
					dataType: 'bytes',
					minLength: CHAIN_ID_LENGTH,
					maxLength: CHAIN_ID_LENGTH,
					fieldNumber: 5,
				},
				receivingChainID: {
					dataType: 'bytes',
					minLength: CHAIN_ID_LENGTH,
					maxLength: CHAIN_ID_LENGTH,
					fieldNumber: 6,
				},
				params: {
					dataType: 'bytes',
					fieldNumber: 7,
				},
				status: {
					dataType: 'uint32',
					fieldNumber: 8,
				},
			},
		};
		Object.assign(allSchemas, {
			ccm: {
				schema: ccmSchema,
			},
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
