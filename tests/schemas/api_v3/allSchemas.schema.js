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
import Joi from 'joi';

const regex = require('./regex');

const genericSchema = {
	$id: Joi.string().required(),
	title: Joi.string().optional(),
	type: Joi.string().required(),
	required: Joi.array().items(Joi.string().pattern(regex.MODULE).required()).required(),
	properties: Joi.object().required(),
};

const commandsParamsSchemasSchema = {
	moduleCommand: Joi.string().pattern(regex.MODULE_COMMAND).required(),
	// TODO: Update schema to required when all schemas are avalable from sdk
	schema: Joi.object(genericSchema).optional(),
};

const eventsSchema = {
	module: Joi.string().pattern(regex.MODULE).required(),
	name: Joi.string().pattern(regex.NAME).required(),
	// TODO: Update schema to required when all schemas are avalable from sdk
	schema: Joi.object(genericSchema).optional(),
};

const assetsSchema = {
	module: Joi.string().pattern(regex.MODULE).required(),
	version: Joi.string().required(),
	// TODO: Update schema to required when all schemas are avalable from sdk
	schema: Joi.object(genericSchema).optional(),
};
const getGenericArraySchema = (params) => Joi.object({
	type: Joi.string().valid('array').required(),
	items: Joi.object({
		dataType: Joi.string().valid(params.dataType).required(),
	}).required(),
	fieldNumber: Joi.number().integer().valid(params.fieldNumber).required(),
});

const getArrayOfBytesSchema = (params) => getGenericArraySchema({ ...params, dataType: 'bytes' });

const getGenericPropertySchema = (params) => Joi.object({
	dataType: Joi.string().valid(params.dataType).required(),
	fieldNumber: Joi.number().integer().valid(params.fieldNumber).required(),
}).required();

const getBytesPropertySchema = (params) => getGenericPropertySchema({ ...params, dataType: 'bytes' });

const getUInt32PropertySchema = (params) => getGenericPropertySchema({ ...params, dataType: 'uint32' });

const getGenericPropertyWithLengthSchema = (params) => Joi.object({
	dataType: Joi.string().valid(params.dataType).required(),
	fieldNumber: Joi.number().integer().valid(params.fieldNumber).required(),
	minLength: Joi.number().integer().valid(params.minLength).required(),
	maxLength: Joi.number().integer().valid(params.maxLength).required(),
}).required();

const blockPropertiesSchema = {
	header: getBytesPropertySchema({ fieldNumber: 1 }),
	transactions: getArrayOfBytesSchema({ fieldNumber: 2 }),
	assets: getArrayOfBytesSchema({ fieldNumber: 3 }),
};

const blockSchema = {
	schema: Joi.object({
		...genericSchema,
		properties: Joi.object(blockPropertiesSchema).required(),
	}).required(),
};

const headerPropertiesSchema = {
	version: getUInt32PropertySchema({ fieldNumber: 1 }),
	timestamp: getUInt32PropertySchema({ fieldNumber: 2 }),
	height: getUInt32PropertySchema({ fieldNumber: 3 }),
	previousBlockID: getBytesPropertySchema({ fieldNumber: 4 }),
	generatorAddress: Joi.object({
		fieldNumber: Joi.number().integer().valid(5).required(),
		dataType: Joi.string().valid('bytes').required(),
		format: Joi.string().valid('lisk32').required(),
	}).required(),
	transactionRoot: getBytesPropertySchema({ fieldNumber: 6 }),
	assetRoot: getBytesPropertySchema({ fieldNumber: 7 }),
	eventRoot: getBytesPropertySchema({ fieldNumber: 8 }),
	stateRoot: getBytesPropertySchema({ fieldNumber: 9 }),
	maxHeightPrevoted: getUInt32PropertySchema({ fieldNumber: 10 }),
	maxHeightGenerated: getUInt32PropertySchema({ fieldNumber: 11 }),
	validatorsHash: getBytesPropertySchema({ fieldNumber: 12 }),
	aggregateCommit: Joi.object({
		type: Joi.string().required(),
		fieldNumber: Joi.number().integer().valid(13).required(),
		required: Joi.array().items(Joi.string().valid(
			'height',
			'aggregationBits',
			'certificateSignature').required()).required(),
		properties: {
			height: getUInt32PropertySchema({ fieldNumber: 1 }),
			aggregationBits: getBytesPropertySchema({ fieldNumber: 2 }),
			certificateSignature: getBytesPropertySchema({ fieldNumber: 3 }),
		},
	}).required(),
	signature: getBytesPropertySchema({ fieldNumber: 14 }),
};

const headerSchema = {
	schema: Joi.object({
		...genericSchema,
		properties: Joi.object(headerPropertiesSchema).required(),
	}).required(),
};

const assetPropertiesSchema = {
	module: getGenericPropertySchema({ dataType: 'string', fieldNumber: 1 }),
	data: getBytesPropertySchema({ fieldNumber: 2 }),
};

const assetSchema = {
	schema: Joi.object({
		...genericSchema,
		properties: Joi.object(assetPropertiesSchema).required(),
	}).required(),
};

const transactionPropertiesSchema = {
	module: getGenericPropertyWithLengthSchema({
		dataType: 'string',
		fieldNumber: 1,
		minLength: 1,
		maxLength: 32,
	}),
	command: getGenericPropertyWithLengthSchema({
		dataType: 'string',
		fieldNumber: 2,
		minLength: 1,
		maxLength: 32,
	}),
	nonce: getGenericPropertySchema({ dataType: 'uint64', fieldNumber: 3 }),
	fee: getGenericPropertySchema({ dataType: 'uint64', fieldNumber: 4 }),
	senderPublicKey: getGenericPropertyWithLengthSchema({
		dataType: 'bytes',
		fieldNumber: 5,
		minLength: 32,
		maxLength: 32,
	}),
	params: getBytesPropertySchema({ fieldNumber: 6 }),
	signatures: getArrayOfBytesSchema({ fieldNumber: 7 }),
};

const transactionSchema = {
	schema: Joi.object({
		...genericSchema,
		properties: Joi.object(transactionPropertiesSchema).required(),
	}).required(),
};

const eventPropertiesSchema = {
	module: getGenericPropertyWithLengthSchema({
		dataType: 'string',
		fieldNumber: 1,
		minLength: 1,
		maxLength: 32,
	}),
	name: getGenericPropertyWithLengthSchema({
		dataType: 'string',
		fieldNumber: 2,
		minLength: 1,
		maxLength: 32,
	}),
	data: getBytesPropertySchema({ fieldNumber: 3 }),
	topics: getArrayOfBytesSchema({ fieldNumber: 4 }),
	height: getUInt32PropertySchema({ fieldNumber: 5 }),
	index: getUInt32PropertySchema({ fieldNumber: 6 }),
};

const eventSchema = {
	schema: Joi.object({
		...genericSchema,
		properties: Joi.object(eventPropertiesSchema).required(),
	}).required(),
};

const allSchemasSchema = {
	block: Joi.object(blockSchema).required(),
	header: Joi.object(headerSchema).required(),
	asset: Joi.object(assetSchema).required(),
	transaction: Joi.object(transactionSchema).required(),
	event: Joi.object(eventSchema).required(),
	events: Joi.array().items(eventsSchema).required(),
	assets: Joi.array().items(assetsSchema).required(),
	commands: Joi.array().items(commandsParamsSchemasSchema).required(),
};

const goodRequestSchema = {
	data: Joi.object().required(),
	meta: Joi.object().required(),
	links: Joi.object().optional(),
};

module.exports = {
	allSchemasSchema: Joi.object(allSchemasSchema).required(),
	goodRequestSchema: Joi.object(goodRequestSchema).required(),
};
