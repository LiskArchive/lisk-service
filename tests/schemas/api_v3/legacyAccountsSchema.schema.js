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

const goodRequestSchema = {
	data: Joi.object().required(),
	meta: Joi.object().required(),
};

const legacyAccountsMetaSchema = {
	address: Joi.string().pattern(regex.ADDRESS_BASE32).required(),
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY).required(),
};

const legacyAccountsSchema = {
	legacyAddress: Joi.string().required(),
	balance: Joi.number().integer().min(0).required(),
};

module.exports = {
	legacyAccountsSchema: Joi.object(legacyAccountsSchema).required(),
	legacyAccountsMetaSchema: Joi.object(legacyAccountsMetaSchema).required(),
	goodRequestSchema: Joi.object(goodRequestSchema).required(),
};
