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

const metaSchema = {
	count: Joi.number().integer().min(0).required(),
	offset: Joi.number().integer().min(0).required(),
	total: Joi.number().integer().min(0).required(),
};

const resultEnvelopeSchema = {
	data: Joi.array().required(),
	meta: metaSchema,
	links: Joi.object().optional(),
};

const emptyResultEnvelopeSchema = {
	data: Joi.array().length(0).required(),
	meta: Joi.object().required(),
	links: Joi.object().optional(),
};

module.exports = {
	metaSchema: Joi.object(metaSchema).required(),
	resultEnvelopeSchema: Joi.object(resultEnvelopeSchema).required(),
	emptyResultEnvelopeSchema: Joi.object(emptyResultEnvelopeSchema).required(),
};
