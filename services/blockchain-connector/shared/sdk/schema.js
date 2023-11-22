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
const { EVENT_NAME_COMMAND_EXECUTION_RESULT } = require('./constants/names');

let schemas;
let metadata;

const setSchemas = _schemas => (schemas = _schemas);

const getAccountSchema = () => schemas.account;

const getBlockSchema = () => schemas.block;

const getBlockHeaderSchema = () => schemas.header;

const getBlockAssetSchema = () => schemas.asset;

const getEventSchema = () => schemas.event;

const getTransactionSchema = () => schemas.transaction;

const getCCMSchema = () => schemas.ccm;

const getTransactionParamsSchema = transaction => {
	const moduleMetadata = metadata.modules.find(m => m.name === transaction.module);
	const { params: schema } = moduleMetadata.commands.find(c => c.name === transaction.command);
	return schema;
};

const setMetadata = _metadata => (metadata = _metadata);

const getBlockAssetDataSchemaByModule = _module => {
	const moduleMetadata = metadata.modules.find(m => m.name === _module);
	const [{ data: schema } = {}] = moduleMetadata.assets;
	return schema;
};

const getDataSchemaByEventName = eventName => {
	if (EVENT_NAME_COMMAND_EXECUTION_RESULT === eventName) return schemas.standardEvent;

	// Find the module that contains the event
	const moduleWithEvent = metadata.modules.find(module =>
		module.events.some(moduleEvent => moduleEvent.name === eventName),
	);

	if (moduleWithEvent) {
		// Find the event and return its data schema
		const moduleEvent = moduleWithEvent.events.find(event => event.name === eventName);
		return moduleEvent ? moduleEvent.data : null;
	}

	return null;
};

module.exports = {
	setSchemas,
	setMetadata,

	getAccountSchema,
	getBlockSchema,
	getBlockHeaderSchema,
	getBlockAssetSchema,
	getBlockAssetDataSchemaByModule,
	getEventSchema,
	getTransactionSchema,
	getTransactionParamsSchema,
	getDataSchemaByEventName,
	getCCMSchema,
};
