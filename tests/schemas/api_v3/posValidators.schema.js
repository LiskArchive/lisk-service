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
import regex from './regex';

const punishmentPeriod = {
	start: Joi.number().integer().min(0).required(),
	end: Joi.number().integer().min(1).required(),
};

const sharingCoefficient = {
	tokenID: Joi.string().pattern(regex.TOKEN_ID).required(),
	coefficient: Joi.string().allow(''),
};

const validatorSchema = {
	name: Joi.string().pattern(regex.NAME).required(),
	totalStake: Joi.string().pattern(regex.POSITIVE_DIGITS).required(),
	selfStake: Joi.string().pattern(regex.POSITIVE_DIGITS).required(),
	validatorWeight: Joi.string().pattern(regex.POSITIVE_DIGITS).required(),
	address: Joi.string().pattern(regex.ADDRESS_LISK32).required(),
	lastGeneratedHeight: Joi.number().integer().min(0).required(),
	status: Joi.string().pattern(regex.POS_VALIDATOR_STATUS).required(),
	isBanned: Joi.boolean().required(),
	reportMisbehaviorHeights: Joi.array().items(Joi.number().integer().min(0)).required(),
	punishmentPeriods: Joi.array().items(punishmentPeriod).required(),
	consecutiveMissedBlocks: Joi.number().integer().min(0).required(),
	commission: Joi.number().integer().min(1).required(),
	lastCommissionIncreaseHeight: Joi.number().integer().min(0).required(),
	sharingCoefficients: Joi.array().items(sharingCoefficient).required(),
	rank: Joi.number().integer().min(1).required(),
	generatedBlocks: Joi.number().integer().min(0).required(),
	totalCommission: Joi.string().pattern(regex.DIGITS).required(),
	totalSelfStakeRewards: Joi.string().pattern(regex.DIGITS).required(),
	earnedRewards: Joi.string().pattern(regex.DIGITS).required(),
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY).allow(null).optional(),
};

const metaSchema = {
	count: Joi.number().integer().min(0).required(),
	offset: Joi.number().integer().min(0).required(),
	total: Joi.number().integer().min(0).required(),
};

const validatorsResponseSchema = {
	data: Joi.array().items(validatorSchema).min(0).required(),
	meta: Joi.object(metaSchema).required(),
	links: Joi.object().optional(),
};

module.exports = {
	validatorsResponseSchema: Joi.object(validatorsResponseSchema).required(),
};
