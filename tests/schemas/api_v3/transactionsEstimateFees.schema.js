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

const dynamicFeeEstimates = {
	low: Joi.string().min(0).required(),
	medium: Joi.string().min(0).required(),
	high: Joi.string().min(0).required(),
};

const genericFeeSchema = {
	tokenID: Joi.string().pattern(regex.TOKEN_ID).required(),
	amount: Joi.string().pattern(regex.DIGITS).required(),
};

const feeSchema = {
	tokenID: Joi.string().pattern(regex.TOKEN_ID).required(),
	minimum: Joi.string().pattern(regex.DIGITS).required(),
	priority: Joi.object(dynamicFeeEstimates).optional(),
};

const paramsSchema = {
	messageFee: Joi.object(genericFeeSchema).required(),
};

const transactionSchema = {
	fee: Joi.object(feeSchema).required(),
	params: Joi.object(paramsSchema).optional(),
};

const dataSchema = {
	transaction: Joi.object(transactionSchema).required(),
};

const additionalFeesSchema = {
	registrationFee: Joi.string().pattern(regex.DIGITS).required(),
	accountInitializationFee: Joi.string().pattern(regex.DIGITS).required(),
};

const minimumFeeBreakdownSchema = {
	byteFee: Joi.string().pattern(regex.DIGITS).required(),
	additionalFees: Joi.object(additionalFeesSchema).optional(),
};

const feeBreakdownSchema = {
	minimum: Joi.object(minimumFeeBreakdownSchema).required(),
};

const metaSchema = {
	feeBreakdown: Joi.object(feeBreakdownSchema).required(),
};

const transactionEstimateFees = {
	data: Joi.object(dataSchema).required(),
	meta: Joi.object(metaSchema).required(),
};

module.exports = {
	transactionEstimateFees: Joi.object(transactionEstimateFees).required(),
};
