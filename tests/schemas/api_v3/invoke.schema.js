/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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

const invokeMetaResponseSchema = {
	endpoint: Joi.string().required(),
	params: Joi.object().optional(),
};

const errorSchema = {
	message: Joi.string().required(),
};

const invokeResponseSchema = {
	data: Joi.object().required(),
	meta: Joi.object(invokeMetaResponseSchema).required(),
};

module.exports = {
	invokeResponseSchema: Joi.object(invokeResponseSchema).required(),
	errorSchema: Joi.object(errorSchema).required(),
};
