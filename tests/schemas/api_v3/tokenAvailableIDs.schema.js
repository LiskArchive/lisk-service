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

const regex = require('./regex');

const tokenAvailableIDsMetaSchema = {
	count: Joi.number().integer().min(0).required(),
	offset: Joi.number().integer().min(0).required(),
	total: Joi.number().integer().min(0).required(),
};

const tokenAvailableIDsSchema = {
	tokenIDs: Joi.array().items(Joi.string().pattern(regex.TOKEN_ID)).required(),
};

const goodResponseSchemaForTokenAvailableIDs = Joi.object({
	data: Joi.object(tokenAvailableIDsSchema).required(),
	meta: Joi.object(tokenAvailableIDsMetaSchema).required(),
}).required();

module.exports = {
	goodResponseSchemaForTokenAvailableIDs,
};
