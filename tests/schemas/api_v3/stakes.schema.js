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

const stake = {
	address: Joi.string().pattern(regex.ADDRESS_LISK32).required(),
	amount: Joi.string().required(),
	name: Joi.string().pattern(regex.NAME).required(),
};

const staker = {
	address: Joi.string().pattern(regex.ADDRESS_LISK32).required(),
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY).optional(),
	name: Joi.string().pattern(regex.NAME).optional(),
};

const data = {
	stakes: Joi.array().items(stake).required(),
};

const meta = {
	staker: Joi.object(staker).required(),
	count: Joi.number().integer().min(0).required(),
};

const stakesResponseSchema = {
	data: Joi.array().items(data).min(0).required(),
	meta: Joi.object(meta).required(),
};

module.exports = {
	stakesResponseSchema: Joi.object(stakesResponseSchema).required(),
};
