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
	name: Joi.string().pattern(regex.EVENT_NAME).required(),
	topics: Joi.array().items(Joi.string().pattern(regex.TOPIC)).required(),
	height: Joi.number().integer().min(0).required(),
	id: Joi.string().pattern(regex.HEX).required(),
};

const dryrunTransactionSuccessResponseSchema = {
	result: Joi.number().integer().valid(1).required(),
	events: Joi.array().items(Joi.object(event).optional()).required(),
};
const dryrunTransactionFailedResponseSchema = {
	result: Joi.number().integer().valid(1).required(),
	events: Joi.array().items(Joi.object(event).optional()).required(),
};
const dryrunTransactionInvalidResponseSchema = {
	result: Joi.number().integer().valid(-1).required(),
	events: Joi.array().items(Joi.object(event).optional()).required(),
	errorMessage: Joi.string().required(),
};

module.exports = {
	dryrunTransactionSuccessResponseSchema: Joi.object(
		dryrunTransactionSuccessResponseSchema,
	).required(),
	dryrunTransactionFailedResponseSchema: Joi.object(
		dryrunTransactionFailedResponseSchema,
	).required(),
	dryrunTransactionInvalidResponseSchema: Joi.object(
		dryrunTransactionInvalidResponseSchema,
	).required(),
	metaSchema: Joi.object().required(),
};
