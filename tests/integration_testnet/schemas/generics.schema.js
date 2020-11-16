/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
import { JSON_RPC } from '../helpers/errorCodes';

const badRequestSchema = {
	error: Joi.boolean().required(),
	message: Joi.string().required(),
};

const notFoundSchema = badRequestSchema;

const invalidParamsSchema = {
	jsonrpc: Joi.string().equal('2.0'),
	id: Joi.alternatives(Joi.number(), Joi.string(), null).required(),
	error: {
		code: Joi.number().required().equal(JSON_RPC.INVALID_PARAMS[0]),
		message: Joi.string().required(),
	},
};

const invalidRequestSchema = {
	jsonrpc: Joi.string().equal('2.0'),
	id: Joi.alternatives(Joi.number(), Joi.string(), null).required(),
	error: {
		code: Joi.number().required().equal(JSON_RPC.INVALID_REQUEST[0]),
		message: Joi.string().required(),
	},
};

const wrongMethodSchema = {
	jsonrpc: Joi.string().equal('2.0'),
	id: Joi.alternatives(Joi.number(), Joi.string(), null).required(),
	error: {
		code: Joi.number().required().equal(JSON_RPC.METHOD_NOT_FOUND[0]),
		message: Joi.string().required(),
	},
};

const metaSchema = {
	count: Joi.number(),
	total: Joi.number(),
	offset: Joi.number(),
};

const envelopeSchema = {
	data: Joi.array().required(),
	meta: metaSchema,
};

const emptyEnvelopeSchema = {
	data: Joi.array().required(),
	meta: Joi.object().required(),
};

const jsonRpcEnvelopeSchema = {
	jsonrpc: Joi.string().equal('2.0'),
	result: Joi.object().required(),
	id: Joi.alternatives(Joi.number(), Joi.string(), null).required(),
};

const emptyResponseSchema = {
	jsonrpc: Joi.string().equal('2.0'),
	result: emptyEnvelopeSchema,
	id: Joi.alternatives(Joi.number(), Joi.string(), null).required(),
};

module.exports = {
	badRequestSchema: Joi.object(badRequestSchema).required(),
	notFoundSchema: Joi.object(notFoundSchema).required(),
	envelopeSchema: Joi.object(envelopeSchema).required(),
	metaSchema: Joi.object(metaSchema).required(),
	invalidParamsSchema: Joi.object(invalidParamsSchema).required(),
	invalidRequestSchema: Joi.object(invalidRequestSchema).required(),
	wrongMethodSchema: Joi.object(wrongMethodSchema).required(),
	emptyEnvelopeSchema: Joi.object(emptyEnvelopeSchema).required(),
	jsonRpcEnvelopeSchema: Joi.object(jsonRpcEnvelopeSchema).required(),
	emptyResponseSchema: Joi.object(emptyResponseSchema).required(),
};
