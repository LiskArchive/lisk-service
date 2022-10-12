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
	const { schema } = schemas.commands
		.find(paramsSchema => paramsSchema.moduleID === transaction.moduleID
			&& paramsSchema.commandID === transaction.commandID);
	return schema;
};

const setMetadata = (_metadata) => metadata = _metadata;

const getDataSchemaByEventName = (eventName) => {
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
	getEventSchema,
	getTransactionSchema,
	getTransactionParamsSchema,
	getDataSchemaByEventName,
};
