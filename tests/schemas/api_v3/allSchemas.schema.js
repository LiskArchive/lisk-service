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
	required: Joi.array().required(),
	properties: Joi.object().required(),
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

const genericSchema = {
	schema: Joi.object(schema).required(),
};

const allSchemasSchema = {
	block: Joi.object(genericSchema).required(),
	header: Joi.object(genericSchema).required(),
	asset: Joi.object(genericSchema).required(),
	transaction: Joi.object(genericSchema).required(),
	event: Joi.object(genericSchema).required(),
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
