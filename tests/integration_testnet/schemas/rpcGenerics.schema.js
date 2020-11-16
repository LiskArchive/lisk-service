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

const { JSON_RPC } = require('../helpers/errorCodes');
const { emptyResultEnvelopeSchema } = require('./generics.schema');

const jsonrpcVersion = '2.0';

const jsonRPCSchema = Joi.string().equal(jsonrpcVersion).required();

const invalidParamsSchema = {
	jsonrpc: jsonRPCSchema,
	id: Joi.alternatives(Joi.number(), Joi.string(), null).required(),
	error: {
		code: Joi.number().required().equal(JSON_RPC.INVALID_PARAMS[0]),
		message: Joi.string().required(),
	},
};

const invalidRequestSchema = {
	jsonrpc: jsonRPCSchema,
	id: Joi.alternatives(Joi.number(), Joi.string(), null).required(),
	error: {
		code: Joi.number().required().equal(JSON_RPC.INVALID_REQUEST[0]),
		message: Joi.string().required(),
	},
};

const wrongMethodSchema = {
	jsonrpc: jsonRPCSchema,
	id: Joi.alternatives(Joi.number(), Joi.string(), null).required(),
	error: {
		code: Joi.number().required().equal(JSON_RPC.METHOD_NOT_FOUND[0]),
		message: Joi.string().required(),
	},
};

const jsonRpcEnvelopeSchema = {
	jsonrpc: jsonRPCSchema,
	result: Joi.object().required(),
	id: Joi.alternatives(Joi.number(), Joi.string(), null).required(),
};

const emptyResponseSchema = {
	jsonrpc: jsonRPCSchema,
	result: emptyResultEnvelopeSchema,
	id: Joi.alternatives(Joi.number(), Joi.string(), null).required(),
};

module.exports = {
	...require('./generics.schema'),
	invalidParamsSchema: Joi.object(invalidParamsSchema).required(),
	invalidRequestSchema: Joi.object(invalidRequestSchema).required(),
	wrongMethodSchema: Joi.object(wrongMethodSchema).required(),
	jsonRpcEnvelopeSchema: Joi.object(jsonRpcEnvelopeSchema).required(),
	emptyResponseSchema: Joi.object(emptyResponseSchema).required(),
};
