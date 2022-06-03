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

const commandParamsSchema = {
	$id: Joi.string().required(),
	title: Joi.string().optional(),
	type: Joi.string().required(),
	required: Joi.array().required(),
	properties: Joi.object().required(),
};

const commandsParamsSchemasSchema = {
	moduleCommandID: Joi.string().required(),
	moduleCommandName: Joi.string().required(),
	// TODO: Update schema to required when all schemas are avalable from sdk
	schema: Joi.object(commandParamsSchema).optional(),
};

module.exports = {
	commandsParamsSchemasSchema: Joi.object(commandsParamsSchemasSchema).required(),
};
