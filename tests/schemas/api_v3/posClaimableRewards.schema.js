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

const { metaSchema } = require('../generics.schema');

const claimableRewards = {
	reward: Joi.string().pattern(regex.DIGITS).required(),
	tokenID: Joi.string().pattern(regex.TOKEN_ID).required(),
};

const goodResponseSchema = {
	data: Joi.array().items(claimableRewards).min(0).required(),
	meta: metaSchema,
};

module.exports = {
	goodResponseSchema: Joi.object(goodResponseSchema).required(),
};
