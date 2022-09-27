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

const logo = {
	png: Joi.string().optional(),
	svg: Joi.string().optional(),
};

const denomUnit = {
	denom: Joi.string().pattern(regex.NAME).required(),
	decimals: Joi.number().integer().required(),
	aliases: Joi.array().items(Joi.string()).optional(),
};

const blockchainAppsTokenMetadataSchema = {
	chainName: Joi.string().pattern(regex.NAME).required(),
	chainID: Joi.string().required(),
	tokenName: Joi.string().pattern(regex.NAME).required(),
	tokenID: Joi.string().required(),
	networkType: Joi.string().pattern(regex.NETWORK).required(),
	description: Joi.string().optional(),
	symbol: Joi.string().required(),
	displayDenom: Joi.string().required(),
	baseDenom: Joi.string().required(),
	denomUnits: Joi.array().items(denomUnit).required(),
	logo: Joi.object(logo).optional(),
};

module.exports = {
	blockchainAppsTokenMetadataSchema: Joi.object(blockchainAppsTokenMetadataSchema).required(),
};
