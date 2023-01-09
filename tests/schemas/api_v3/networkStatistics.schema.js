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

const basicStatsSchema = {
	totalPeers: Joi.number().integer().min(0).required(),
	connectedPeers: Joi.number().integer().min(0).required(),
	disconnectedPeers: Joi.number().integer().min(0).required(),
};

const totalItem = {
	amount: Joi.string().pattern(regex.POSITIVE_DIGITS).required(),
	tokenID: Joi.string().pattern(regex.TOKEN_ID).required(),
};

const networkStatisticsSchema = {
	basic: Joi.object(basicStatsSchema).required(),
	height: Joi.object().required(),
	networkVersion: Joi.object().required(),
	totalLocked: Joi.array().items(Joi.object(totalItem).required()).required(),
	totalStaked: Joi.object(totalItem).required(),
};

module.exports = {
	networkStatisticsSchema: Joi.object(networkStatisticsSchema).required(),
};
