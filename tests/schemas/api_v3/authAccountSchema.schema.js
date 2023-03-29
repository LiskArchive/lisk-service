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

const goodRequestSchemaForAuth = {
	data: Joi.object().required(),
	meta: Joi.object().required(),
};

const authAccountMetaSchema = {
	address: Joi.string().pattern(regex.ADDRESS_LISK32).required(),
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY).required(),
	name: Joi.string().pattern(regex.NAME).required(),
};

const authAccountInfoSchema = {
	nonce: Joi.string().required(),
	numberOfSignatures: Joi.number().integer().min(0).required(),
	mandatoryKeys: Joi.array().items(Joi.string()).optional(),
	optionalKeys: Joi.array().items(Joi.string()).optional(),
};

module.exports = {
	authAccountInfoSchema: Joi.object(authAccountInfoSchema).required(),
	authAccountMetaSchema: Joi.object(authAccountMetaSchema).required(),
	goodRequestSchemaForAuth: Joi.object(goodRequestSchemaForAuth).required(),
};
