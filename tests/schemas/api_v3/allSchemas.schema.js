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

const schema = {
	$id: Joi.string().required(),
	title: Joi.string().optional(),
	type: Joi.string().required(),
	required: Joi.array().items(Joi.string().pattern(regex.MODULE).required()).required(),
	properties: Joi.object().optional(),
	items: Joi.array().items(Joi.object().required()).optional(),
};

const commandsParamsSchemasSchema = {
	moduleCommand: Joi.string().pattern(regex.MODULE_COMMAND).required(),
	// TODO: Update schema to required when all schemas are avalable from sdk
	schema: Joi.object(schema).optional(),
};

const eventsSchema = {
	module: Joi.string().pattern(regex.MODULE).required(),
	name: Joi.string().pattern(regex.NAME).required(),
	// TODO: Update schema to required when all schemas are avalable from sdk
	schema: Joi.object(schema).optional(),
};

const assetsSchema = {
	module: Joi.string().pattern(regex.MODULE).required(),
	version: Joi.string().required(),
	// TODO: Update schema to required when all schemas are avalable from sdk
	schema: Joi.object(schema).optional(),
};

const fieldNumberSchema = Joi.number().integer().positive().required();
const typeSchema = Joi.string().required();

const simpleArraySchema = {
	type: typeSchema,
	items: Joi.object({
		dataType: Joi.string().required(),
	}).required(),
	fieldNumber: fieldNumberSchema,
};

const simplePropertySchema = {
	dataType: Joi.string().required(),
	fieldNumber: fieldNumberSchema,
};

const propertyWithLengthSchema = {
	...simplePropertySchema,
	minLength: Joi.number().min(0).required(),
	maxLength: Joi.number().min(0).required(),
};

const blockPropertiseScheama = {
	header: Joi.object(simplePropertySchema).required(),
	transactions: Joi.object(simpleArraySchema).required(),
	assets: Joi.object(simpleArraySchema).required(),
};

const blockSchema = {
	schema: Joi.object({
		...schema,
		properties: Joi.object(blockPropertiseScheama).required(),
	}).required(),
};

const headerPropertiesSchema = {
	version: Joi.object(simplePropertySchema).required(),
	timestamp: Joi.object(simplePropertySchema).required(),
	height: Joi.object(simplePropertySchema).required(),
	previousBlockID: Joi.object(simplePropertySchema).required(),
	generatorAddress: Joi.object({
		...simplePropertySchema,
		format: Joi.string().required(),
	}).required(),
	transactionRoot: Joi.object(simplePropertySchema).required(),
	assetRoot: Joi.object(simplePropertySchema).required(),
	eventRoot: Joi.object(simplePropertySchema).required(),
	stateRoot: Joi.object(simplePropertySchema).required(),
	maxHeightPrevoted: Joi.object(simplePropertySchema).required(),
	maxHeightGenerated: Joi.object(simplePropertySchema).required(),
	validatorsHash: Joi.object(simplePropertySchema).required(),
	aggregateCommit: Joi.object({
		type: Joi.string().required(),
		fieldNumber: fieldNumberSchema,
		required: Joi.array().items(Joi.string().required()).required(),
		properties: {
			height: Joi.object(simplePropertySchema).required(),
			aggregationBits: Joi.object(simplePropertySchema).required(),
			certificateSignature: Joi.object(simplePropertySchema).required(),
		},
	}).required(),
	signature: Joi.object(simplePropertySchema).required(),
};

const headerSchema = {
	schema: Joi.object({
		...schema,
		properties: Joi.object(headerPropertiesSchema).required(),
	}).required(),
};

const assetPropertiesSchema = {
	module: Joi.object(simplePropertySchema).required(),
	data: Joi.object(simplePropertySchema).required(),
};

const assetSchema = {
	schema: Joi.object({
		...schema,
		properties: Joi.object(assetPropertiesSchema).required(),
	}).required(),
};

const transactionPropertiesSchema = {
	module: Joi.object(propertyWithLengthSchema).required(),
	command: Joi.object(propertyWithLengthSchema).required(),
	nonce: Joi.object(simplePropertySchema).required(),
	fee: Joi.object(simplePropertySchema).required(),
	senderPublicKey: Joi.object(propertyWithLengthSchema).required(),
	params: Joi.object(simplePropertySchema).required(),
	signatures: Joi.object(simpleArraySchema).optional(),
};

const transactionSchema = {
	schema: Joi.object({
		...schema,
		properties: Joi.object(transactionPropertiesSchema).required(),
	}).required(),
};

const eventPropertiesSchema = {
	module: propertyWithLengthSchema,
	name: propertyWithLengthSchema,
	data: simplePropertySchema,
	topics: simpleArraySchema,
	height: simplePropertySchema,
	index: simplePropertySchema,
};

const eventSchema = {
	schema: Joi.object({
		...schema,
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
