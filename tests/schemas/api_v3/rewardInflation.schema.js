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
import regex from './regex';

const data = {
	// TODO: Verify and update the schema
	tokenID: Joi.string().pattern(regex.TOKEN_ID).optional(),
	rate: Joi.string().required(),
};

const meta = {};

const rewardInflationResponseSchema = {
	data: Joi.object(data).required(),
	meta: Joi.object(meta).required(),
};

module.exports = {
	rewardInflationResponseSchema: Joi.object(rewardInflationResponseSchema).required(),
};
