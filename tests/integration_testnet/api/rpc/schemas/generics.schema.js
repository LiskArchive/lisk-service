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

import Joi from '@hapi/joi';

const invalidParamsSchema = Joi.object({
	code: Joi.number().required(),
	message: Joi.string().required(),
});

const metaSchema = Joi.object({
	count: Joi.number(),
	total: Joi.number(),
}).required();

const envelopeSchema = Joi.object({
	data: Joi.array().required(),
	meta: metaSchema,
}).required();

const emptyEnvelopeSchema = Joi.object({
	data: Joi.array().required(),
	meta: Joi.object().required(),
}).required();

module.exports = {
	invalidParamsSchema,
	metaSchema,
	envelopeSchema,
	emptyEnvelopeSchema,
};
