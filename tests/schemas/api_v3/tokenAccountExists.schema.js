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

const dataSchema = {
	isExists: Joi.boolean().required(),
};

const metaSchema = {};

const tokenAccountExistsSchema = {
	data: Joi.object(dataSchema).required(),
	meta: Joi.object(metaSchema).required(),
	links: Joi.object().optional(),
};

module.exports = {
	tokenAccountExistsSchema: Joi.object(tokenAccountExistsSchema).required(),
};
