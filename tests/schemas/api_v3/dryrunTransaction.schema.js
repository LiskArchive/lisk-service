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

const event = {
	data: Joi.object().required(),
	index: Joi.number().integer().min(0).required(),
	module: Joi.string().pattern(regex.MODULE).required(),
	name: Joi.string().pattern(regex.NAME).required(),
	topics: Joi.array().items(Joi.string().pattern(regex.TOPIC)).required(),
	height: Joi.number().positive().required(),
};

const dryrunTransactionResponseSchema = {
	success: Joi.boolean().required(),
	events: Joi.array().items(Joi.object(event).optional()).required(),
};

const metaParams = {
	isSkipVerify: Joi.boolean().required(),
	transaction: Joi.object().required(),
};

const metaSchema = {
	params: Joi.object(metaParams).required(),
};

const goodRequestSchema = {
	data: Joi.object(dryrunTransactionResponseSchema).required(),
	meta: Joi.object(metaSchema).required(),
};

module.exports = {
	goodRequestSchema: Joi.object(goodRequestSchema).required(),
	dryrunTransactionResponseSchema: Joi.object(dryrunTransactionResponseSchema).required(),
	metaSchema: Joi.object(metaSchema).required(),
};
