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

const TRANSACTION_VERIFY_RESULT = {
	INVALID: -1,
	PENDING: 0,
	OK: 1,
};

const TRANSACTION_VERIFY_STATUSES = Object
	.keys(TRANSACTION_VERIFY_RESULT).map(e => e.toLowerCase());

const event = {
	data: Joi.object().required(),
	index: Joi.number().integer().min(0).required(),
	module: Joi.string().pattern(regex.MODULE).required(),
	name: Joi.string().pattern(regex.EVENT_NAME).required(),
	topics: Joi.array().items(Joi.string().pattern(regex.TOPIC)).required(),
	height: Joi.number().integer().min(0).required(),
	id: Joi.string().pattern(regex.HEX).required(),
};

const eventSchemaWithSkipDecode = {
	...event,
	id: Joi.string().pattern(regex.HEX).optional(), // TODO: Verify and fix
	data: Joi.string().required(),
};

const dryrunTransactionSuccessResponseSchema = {
	result: Joi.number().integer().valid(TRANSACTION_VERIFY_RESULT.OK).required(),
	status: Joi.string().valid(...TRANSACTION_VERIFY_STATUSES).required(),
	events: Joi.array().items(Joi.object(event).required()).min(1).required(),
};

const dryrunTxSuccessSchemaWithSkipDecode = {
	result: Joi.number().integer().valid(TRANSACTION_VERIFY_RESULT.OK).required(),
	status: Joi.string().valid(...TRANSACTION_VERIFY_STATUSES).required(),
	events: Joi.array().items(Joi.object(eventSchemaWithSkipDecode).required()).min(1).required(),
};

const dryrunTransactionPendingResponseSchema = {
	result: Joi.number().integer().valid(TRANSACTION_VERIFY_RESULT.PENDING).required(),
	status: Joi.string().valid(...TRANSACTION_VERIFY_STATUSES).required(),
	events: Joi.array().items(Joi.object(event).required()).min(1).required(),
};
const dryrunTransactionInvalidResponseSchema = {
	result: Joi.number().integer().valid(TRANSACTION_VERIFY_RESULT.INVALID).required(),
	status: Joi.string().valid(...TRANSACTION_VERIFY_STATUSES).required(),
	events: Joi.array().length(0).required(),
	errorMessage: Joi.string().required(),
};

const goodRequestSchemaFortransactionsDryRun = {
	data: Joi.object().required(),
	meta: Joi.object().optional(),
};

module.exports = {
	dryrunTransactionSuccessResponseSchema: Joi.object(
		dryrunTransactionSuccessResponseSchema,
	).required(),
	dryrunTxSuccessSchemaWithSkipDecode: Joi.object(
		dryrunTxSuccessSchemaWithSkipDecode,
	).required(),
	dryrunTransactionPendingResponseSchema: Joi.object(
		dryrunTransactionPendingResponseSchema,
	).required(),
	dryrunTransactionInvalidResponseSchema: Joi.object(
		dryrunTransactionInvalidResponseSchema,
	).required(),
	metaSchema: Joi.object().optional(),
	goodRequestSchemaFortransactionsDryRun: Joi.object(
		goodRequestSchemaFortransactionsDryRun,
	).optional(),
};
