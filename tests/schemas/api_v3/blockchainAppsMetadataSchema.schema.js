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

const apis = {
	rest: Joi.string().required(),
	rpc: Joi.string().required(),
};

const blockchainAppMetadataSchema = {
	name: Joi.string().pattern(regex.NAME).required(),
	chainID: Joi.number().integer().min(1).required(),
	network: Joi.string().pattern(regex.NETWORK).required(),
	isDefault: Joi.boolean().required(),
	title: Joi.string().optional(),
	description: Joi.string().optional(),
	genesisBlock: Joi.string().optional(),
	homepage: Joi.string().required(),
	apis: Joi.array().items(apis).required(),
	explorers: Joi.array().items(Joi.string()).optional(),
	logo: Joi.object(logo).optional(),
	backgroundColor: Joi.string().optional(),
};

module.exports = {
	blockchainAppMetadataSchema: Joi.object(blockchainAppMetadataSchema).required(),
};
