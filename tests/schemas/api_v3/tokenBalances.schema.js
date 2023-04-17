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

const lockedBalance = {
	module: Joi.string().pattern(regex.MODULE).required(),
	amount: Joi.string().required(),
};

const tokenBalancesMetaSchema = {
	address: Joi.string().pattern(regex.ADDRESS_LISK32).required(),
	count: Joi.number().integer().min(0).required(),
	offset: Joi.number().integer().min(0).required(),
	total: Joi.number().integer().min(0).required(),
};

const tokenBalancesSchema = {
	tokenID: Joi.string().required(),
	availableBalance: Joi.string().required(),
	lockedBalances: Joi.array().items(lockedBalance).required(),
};

const supportedToken = {
	tokenID: Joi.string().required(),
	name: Joi.string().optional(),
	symbol: Joi.string().optional(),
};

const supportedTokensSchema = {
	supportedTokens: Joi.array().items(supportedToken).required(),
};

const goodRequestSchemaForSupportedTokens = {
	data: Joi.object(supportedTokensSchema).required(),
	meta: Joi.object().required(),
};

module.exports = {
	tokenBalancesSchema: Joi.object(tokenBalancesSchema).required(),
	supportedTokensSchema: Joi.object(supportedTokensSchema).required(),
	tokenBalancesMetaSchema: Joi.object(tokenBalancesMetaSchema).required(),
	goodRequestSchemaForSupportedTokens: Joi.object(goodRequestSchemaForSupportedTokens).required(),
};
