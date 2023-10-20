/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const Joi = require('joi');

const marketPriceItemSchema = {
	code: Joi.string()
		.pattern(/^[A-Z]{3,4}_[A-Z]{3,4}$/)
		.required(),
	from: Joi.string()
		.pattern(/^[A-Z]{3,4}$/)
		.required(),
	to: Joi.string()
		.pattern(/^[A-Z]{3,4}$/)
		.required(),
	rate: Joi.string().required(),
	updateTimestamp: Joi.number().integer().positive().required(),
	sources: Joi.array().items(Joi.string().required()).required(),
};

module.exports = {
	marketPriceItemSchema: Joi.object(marketPriceItemSchema).required(),
};
