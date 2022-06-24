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

const data = {
	recipientAddress: Joi.string().pattern(regex.ADDRESS_BASE32).required(),
	data: Joi.string().required(),
	amount: Joi.string().optional(),
};

const getCurrentTime = () => Math.floor(Date.now() / 1000);

const block = {
	id: Joi.string().required(),
	height: Joi.number().integer().min(1).required(),
	timestamp: Joi.number().integer().positive().max(getCurrentTime())
		.required(),
};

const eventSchema = {
	moduleID: Joi.string().required(),
	moduleName: Joi.string().required(),
	typeID: Joi.string().required(),
	data: Joi.object(data).required(),
	topics: Joi.array().required(),
	block: Joi.object(block).optional(),
};

module.exports = {
	eventSchema: Joi.object(eventSchema),
};
