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
const { getSchema } = require('./actions_1');

const getAccountSchema = async () => {
	const allSchemas = await getSchema();
	return allSchemas.account;
};

const getBlockSchema = async () => {
	const allSchemas = await getSchema();
	return allSchemas.block;
};

const getBlockHeaderSchema = async () => {
	const allSchemas = await getSchema();
	return allSchemas.blockHeader;
};

const getBlockAssetSchema = async () => {
	// TODO: Retrieve block asset schema from core directly once available
	const assetSchema = {
		$id: '/block/assets/3',
		type: 'object',
		required: ['moduleID', 'data'],
		properties: {
			moduleID: {
				dataType: 'uint32',
				fieldNumber: 1,
			},
			data: {
				dataType: 'bytes',
				fieldNumber: 2,
			},
		},
	};
	return assetSchema;
};

const getTransactionSchema = async () => {
	const allSchemas = await getSchema();
	return allSchemas.transaction;
};

const getTransactionParamsSchema = async (transaction) => {
	const allSchemas = await getSchema();
	const { schema } = allSchemas.commands
		.find(paramsSchema => paramsSchema.moduleID === transaction.moduleID
			&& paramsSchema.commandID === transaction.commandID);
	return schema;
};

module.exports = {
	getAccountSchema,
	getBlockSchema,
	getBlockHeaderSchema,
	getBlockAssetSchema,
	getTransactionSchema,
	getTransactionParamsSchema,
};
