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

const topAccountsMetaSchema = {
	count: Joi.number().integer().min(1).required(),
	offset: Joi.number().integer().min(0).required(),
};

const topAccountsSchema = {
	address: Joi.string().pattern(regex.ADDRESS_BASE32).required(),
	balance: Joi.string().required(),
	owner: Joi.string().allow('').required(),
	description: Joi.string().allow('').required(),
};

module.exports = {
	topAccountsSchema: Joi.object(topAccountsSchema).required(),
	topAccountsMetaSchema: Joi.object(topAccountsMetaSchema).required(),
};
