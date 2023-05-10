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
	low: Joi.number().min(0).required(),
	medium: Joi.number().min(0).required(),
	high: Joi.number().min(0).required(),
};

const genericFeeSchema = {
	tokenID: Joi.string().pattern(regex.TOKEN_ID).required(),
	amount: Joi.string().pattern(regex.DIGITS).required(),
};

const transactionFeeEstimates = {
	minFee: Joi.string().required(),
	accountInitializationFee: Joi.object(genericFeeSchema).required(),
	messageFee: Joi.object(genericFeeSchema).optional(),
};

const dataSchema = {
	transactionFeeEstimates: Joi.object(transactionFeeEstimates).required(),
	dynamicFeeEstimates: Joi.object(dynamicFeeEstimates).required(),
};

const metaSchema = {};

const transactionEstimateFees = {
	data: Joi.object(dataSchema).required(),
	meta: Joi.object(metaSchema).required(),
};

module.exports = {
	transactionEstimateFees: Joi.object(transactionEstimateFees).required(),
};
