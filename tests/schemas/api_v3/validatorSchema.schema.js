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

const goodRequestSchemaForValidator = {
	data: Joi.object().required(),
	meta: Joi.object().required(),
};

const validatorMetaSchema = {
	address: Joi.string().pattern(regex.ADDRESS_BASE32).required(),
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY).required(),
	name: Joi.string().pattern(regex.NAME).required(),
};

const validatorInfoSchema = {
	generatorKey: Joi.string().required(),
	blsKey: Joi.string().required(),
};

module.exports = {
	validatorInfoSchema: Joi.object(validatorInfoSchema).required(),
	validatorMetaSchema: Joi.object(validatorMetaSchema).required(),
	goodRequestSchemaForValidator: Joi.object(goodRequestSchemaForValidator).required(),
};
