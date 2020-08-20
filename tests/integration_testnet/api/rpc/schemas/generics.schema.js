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
import { JSON_RPC } from '../../../helpers/errorCodes';

export const invalidParamsSchema = Joi.object({
	jsonrpc: Joi.string().equal('2.0'),
	code: Joi.number().required().equal(JSON_RPC.INVALID_PARAMS[0]),
	message: Joi.string().required(),
});

export const metaSchema = Joi.object({
	count: Joi.number(),
	total: Joi.number(),
	offset: Joi.number(),
}).required();

export const envelopeSchema = Joi.object({
	data: Joi.array().required(),
	meta: metaSchema,
}).required();

export const emptyEnvelopeSchema = Joi.object({
	data: Joi.array().required(),
	meta: Joi.object().required(),
}).required();

export const jsonRpcEnvelopeSchema = Joi.object({
	jsonrpc: Joi.string().equal('2.0'),
	result: Joi.object().required(),
	id: Joi.number().required(),
}).required();
