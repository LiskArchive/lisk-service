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

const regex = require('./regex');

const extraCommandFeesSchema = {
	userAccountInitializationFee: Joi.string().pattern(regex.DIGITS).required(),
	escrowAccountInitializationFee: Joi.string().pattern(regex.DIGITS).required(),
};

const constantsSchema = {
	extraCommandFees: Joi.object(extraCommandFeesSchema).required(),
};

const tokenConstantsMetaSchema = {};

module.exports = {
	tokenConstantsSchema: Joi.object(constantsSchema).required(),
	tokenConstantsMetaSchema: Joi.object(tokenConstantsMetaSchema).required(),
};
