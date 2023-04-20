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
	required: Joi.array().items(Joi.string().pattern(regex.MODULE).required()).optional(),
	properties: Joi.object().optional(),
	items: Joi.array().items(Joi.object().required()).optional(),
};

const commandsParamsSchemasSchema = {
	moduleCommand: Joi.string().pattern(regex.MODULE_COMMAND).required(),
	// TODO: Update schema to required when all schemas are available from SDK
	schema: Joi.object(schema).optional(),
};

const messagesSchema = {
	moduleCommand: Joi.string().pattern(regex.MODULE_COMMAND).required(),
	param: Joi.string().required(),
	schema: Joi.object(schema).required(),
};

const eventsSchema = {
	module: Joi.string().pattern(regex.MODULE).required(),
	name: Joi.string().pattern(regex.EVENT_NAME).required(),
	// TODO: Update schema to required when all schemas are available from SDK
	schema: Joi.object(schema).optional(),
};

const assetsSchema = {
	module: Joi.string().pattern(regex.MODULE).required(),
	version: Joi.string().required(),
	// TODO: Update schema to required when all schemas are available from SDK
	schema: Joi.object(schema).optional(),
};

const genericSchema = {
	schema: Joi.object(schema).required(),
};

const ccmSchema = {
	schema: Joi.object(schema).required(),
};

const allSchemasSchema = {
	block: Joi.object(genericSchema).required(),
	header: Joi.object(genericSchema).required(),
	asset: Joi.object(genericSchema).required(),
	transaction: Joi.object(genericSchema).required(),
	event: Joi.object(genericSchema).required(),
	standardEvent: Joi.object(genericSchema).required(),
	ccm: Joi.object(ccmSchema).required(),
	events: Joi.array().items(eventsSchema).required(),
	assets: Joi.array().items(assetsSchema).required(),
	commands: Joi.array().items(commandsParamsSchemasSchema).required(),
	messages: Joi.array().items(messagesSchema).min(0).required(),
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
