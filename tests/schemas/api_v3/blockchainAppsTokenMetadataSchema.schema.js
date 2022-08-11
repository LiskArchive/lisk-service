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

const assets = {
	name: Joi.string().pattern(regex.NAME).required(),
	description: Joi.string().optional(),
	symbol: Joi.string().required(),
	display: Joi.string().required(),
	base: Joi.string().required(),
	exponent: Joi.integer().min(1).required(),
	logo: Joi.object(logo).optional(),
};

const blockchainAppsTokenMetadataSchema = {
	chainName: Joi.string().pattern(regex.NAME).required(),
	chainID: Joi.number().integer().min(1).required(),
	assets: Joi.array().items(assets).required(),
};

module.exports = {
	blockchainAppsTokenMetadataSchema: Joi.object(blockchainAppsTokenMetadataSchema).required(),
};
