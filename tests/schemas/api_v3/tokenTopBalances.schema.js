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
import regex from './regex';

const tokenTopBalancesMetaSchema = {
	count: Joi.number().integer().min(0).required(),
	offset: Joi.number().integer().min(0).required(),
	total: Joi.number().integer().min(0).required(),
};

const knowledgeSchema = {
	owner: Joi.string().optional(),
	description: Joi.string().optional(),
};

const tokenTopBalancesSchema = {
	address: Joi.string().pattern(regex.ADDRESS_LISK32).required(),
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY),
	name: Joi.string().pattern(regex.NAME),
	balance: Joi.string().required(),
	knowledge: Joi.object(knowledgeSchema).required(),
};

const tokensKey = Joi.string().pattern(regex.TOKEN_ID).required();
const tokenTopBalancesEntry = Joi.array().items(tokenTopBalancesSchema).required();

const goodResponseSchemaForTokenTopBalances = Joi.object({
	data: Joi.object().pattern(tokensKey, tokenTopBalancesEntry).required(),
	meta: Joi.object(tokenTopBalancesMetaSchema).required(),
}).required();

module.exports = {
	goodResponseSchemaForTokenTopBalances,
};
