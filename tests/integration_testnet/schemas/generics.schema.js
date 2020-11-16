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

module.exports = {
	metaSchema: Joi.object(metaSchema).required(),
	envelopeSchema: Joi.object(envelopeSchema).required(),
	emptyEnvelopeSchema: Joi.object(emptyEnvelopeSchema).required(),
};
