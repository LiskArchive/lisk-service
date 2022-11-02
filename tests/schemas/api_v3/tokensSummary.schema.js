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

const commonProperties = {
	tokenID: Joi.string().pattern(regex.TOKEN_ID).required(),
};

const escrowedAmounts = {
	...commonProperties,
	escrowChainID: Joi.string().pattern(regex.CHAIN_ID).required(),
	amount: Joi.string().pattern(regex.DIGITS).required(),
};

const supportedTokens = {
	...commonProperties,
};

const totalSupply = {
	...commonProperties,
	amount: Joi.string().pattern(regex.DIGITS).required(),
};

const tokensSummaryResponseSchema = {
	escrowedAmounts: Joi.array().items(escrowedAmounts).required(),
	supportedTokens: Joi.array().items(supportedTokens).required(),
	totalSupply: Joi.array().items(totalSupply).required(),
};

const tokensSummaryMetaResponseSchema = {};

const goodResponseSchema = {
	data: Joi.object(tokensSummaryResponseSchema).required(),
	meta: Joi.object(tokensSummaryMetaResponseSchema).required(),
};

module.exports = {
	tokensSummaryResponseSchema: Joi.object(tokensSummaryResponseSchema).required(),
	goodResponseSchema: Joi.object(goodResponseSchema).required(),
	tokensSummaryMetaResponseSchema: Joi.object(tokensSummaryMetaResponseSchema).required(),
};
