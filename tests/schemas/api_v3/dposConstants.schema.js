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

const constantsSchema = {
	factorSelfVotes: Joi.number().min(0).required(),
	maxLengthName: Joi.number().min(0).required(),
	maxNumberSentVotes: Joi.number().min(0).required(),
	maxNumberPendingUnlocks: Joi.number().min(0).required(),
	failSafeMissedBlocks: Joi.number().min(0).required(),
	failSafeInactiveWindow: Joi.number().min(0).required(),
	punishmentWindow: Joi.number().min(0).required(),
	roundLength: Joi.number().min(0).required(),
	bftThreshold: Joi.number().min(0).required(),
	minWeightStandby: Joi.string().required(),
	numberActiveDelegates: Joi.number().min(0).required(),
	numberStandbyDelegates: Joi.number().min(0).required(),
	tokenIDDPoS: Joi.string().required(),
};

const dposConstantsMetaSchema = {};

module.exports = {
	dposConstantsSchema: Joi.object(constantsSchema).required(),
	dposConstantsMetaSchema: Joi.object(dposConstantsMetaSchema).required(),
};
