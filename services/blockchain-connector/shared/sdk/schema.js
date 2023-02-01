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
const { genesisPosStoreSchema } = require('./storeSchemas');

let schemas;
let metadata;

const setSchemas = (_schemas) => schemas = _schemas;

const getAccountSchema = () => schemas.account;

const getBlockSchema = () => schemas.block;

const getBlockHeaderSchema = () => schemas.header;

const getBlockAssetSchema = () => schemas.asset;

const getEventSchema = () => schemas.event;

const getTransactionSchema = () => schemas.transaction;

const getTransactionParamsSchema = (transaction) => {
	const moduleMetadata = metadata.modules.find(m => m.name === transaction.module);
	const { params: schema } = moduleMetadata.commands.find(c => c.name === transaction.command);
	return schema;
};

const setMetadata = (_metadata) => metadata = _metadata;

const getBlockAssetDataSchemaByModule = (_module) => {
	const moduleMetadata = metadata.modules.find(m => m.name === _module);

	// TODO: Enable the logic with Lisk SDK alpha.12 once SDK resolves issue: https://github.com/LiskHQ/lisk-sdk/issues/7993
	// const [{ data: schema } = {}] = moduleMetadata.assets;
	const [{ data: schema } = {}] = _module !== 'pos'
		? moduleMetadata.assets
		: [{ version: 0, data: genesisPosStoreSchema }];
	return schema;
};

const getDataSchemaByEventName = (eventName) => {
	// TODO: Temporary patch, clean up
	if (eventName === 'commandExecutionResult') return schemas.standardEvent;

	// TODO: Optimize
	for (let i = 0; i < metadata.modules.length; i++) {
		const module = metadata.modules[i];

		for (let eventIndex = 0; eventIndex < module.events.length; eventIndex++) {
			const moduleEvent = module.events[eventIndex];
			if (moduleEvent.name === eventName) return module.events[eventIndex].data;
		}
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
};
