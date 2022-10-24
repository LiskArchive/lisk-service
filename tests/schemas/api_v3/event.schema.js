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

const getCurrentTime = () => Math.floor(Date.now() / 1000);

const block = {
	id: Joi.string().pattern(regex.HASH_SHA256)
		.required(),
	height: Joi.number().integer().min(1).required(),
	timestamp: Joi.number().integer().positive().max(getCurrentTime())
		.required(),
};

const eventSchema = {
	id: Joi.string().required(),
	module: Joi.string().pattern(regex.MODULE).required(),
	name: Joi.string().pattern(regex.EVENT_NAME).required(),
	index: Joi.number().integer().min(0).required(),
	data: Joi.object().required(),
	topics: Joi.array().items(Joi.string().pattern(regex.TOPIC)).required(),
	block: Joi.object(block).required(),
};

module.exports = {
	eventSchema: Joi.object(eventSchema),
};
