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

const extraCommandFeesSchema = {
	validatorRegistrationFee: Joi.string().pattern(regex.DIGITS).required(),
};

const constantsSchema = {
	factorSelfStakes: Joi.number().min(0).required(),
	maxLengthName: Joi.number().min(0).required(),
	maxNumberSentStakes: Joi.number().min(0).required(),
	maxNumberPendingUnlocks: Joi.number().min(0).required(),
	failSafeMissedBlocks: Joi.number().min(0).required(),
	failSafeInactiveWindow: Joi.number().min(0).required(),
	punishmentWindow: Joi.number().min(0).required(),
	roundLength: Joi.number().min(0).required(),
	minWeightStandby: Joi.string().pattern(regex.DIGITS).required(),
	numberActiveValidators: Joi.number().min(0).required(),
	numberStandbyValidators: Joi.number().min(0).required(),
	posTokenID: Joi.string().pattern(regex.TOKEN_ID).required(),
	maxBFTWeightCap: Joi.number().min(0).required(),
	commissionIncreasePeriod: Joi.number().min(0).required(),
	maxCommissionIncreaseRate: Joi.number().min(0).required(),
	extraCommandFees: Joi.object(extraCommandFeesSchema).required(),
};

const posConstantsMetaSchema = {};

module.exports = {
	posConstantsSchema: Joi.object(constantsSchema).required(),
	posConstantsMetaSchema: Joi.object(posConstantsMetaSchema).required(),
};
