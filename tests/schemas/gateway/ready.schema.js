/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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

const services = {
	indexer: Joi.boolean().required(),
	connector: Joi.boolean().required(),
	fees: Joi.boolean().optional(),
	market: Joi.boolean().optional(),
	newsfeed: Joi.boolean().optional(),
	'app-registry': Joi.boolean().optional(),
	statistics: Joi.boolean().optional(),
};

const readySchema = {
	services: Joi.object(services).required(),
};

module.exports = {
	readySchema: Joi.object(readySchema).required(),
};
