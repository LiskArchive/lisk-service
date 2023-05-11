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

const GENERATOR_STATUSES = [
	'active',
	'standby',
	'punished',
	'banned',
	'ineligible',
];

const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

const generatorDataSchema = {
	address: Joi.string().pattern(regex.ADDRESS_LISK32).required(),
	name: Joi.string().pattern(regex.NAME).optional(),
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY).allow(null).optional(),
	nextAllocatedTime: Joi.number().integer().min(getCurrentTimestamp() - 20).required(),
	status: Joi.string().valid(...GENERATOR_STATUSES).required(),
};

const generatorResponseSchema = {
	data: Joi.array().items(generatorDataSchema).required(),
	meta: Joi.object().required(),
};

module.exports = {
	generatorResponseSchema: Joi.object(generatorResponseSchema).required(),
};
