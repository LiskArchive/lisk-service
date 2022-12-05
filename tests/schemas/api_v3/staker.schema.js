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

const staker = {
	address: Joi.string().pattern(regex.ADDRESS_LISK32).required(),
	amount: Joi.string().required(),
	name: Joi.string().pattern(regex.NAME).optional(),
};

const validatorSchema = {
	address: Joi.string().pattern(regex.ADDRESS_LISK32).required(),
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY).required(),
	name: Joi.string().pattern(regex.NAME).required(),
};

const dataSchema = {
	stakers: Joi.array().items(staker).min(0).required(),
};

const metaSchema = {
	validator: Joi.object(validatorSchema).required(),
	count: Joi.number().integer().min(0).required(),
	offset: Joi.number().integer().min(0).required(),
	total: Joi.number().integer().min(0).required(),
};

const goodRequestSchema = {
	data: Joi.object(dataSchema).required(),
	meta: Joi.object(metaSchema).required(),
	links: Joi.object().optional(),
};

module.exports = {
	goodRequestSchema: Joi.object(goodRequestSchema).required(),
	metaSchema: Joi.object(metaSchema).required(),
};
