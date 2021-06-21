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

const serviceUnavailableSchema = {
	status: Joi.string().valid('SERVICE_UNAVAILABLE').required(),
	data: Joi.object().keys({
		error: Joi.string().valid('Service not available').required(),
	}).required(),
};

module.exports = {
	serviceUnavailableSchema: Joi.object(serviceUnavailableSchema).required(),
};
