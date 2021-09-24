/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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

const networkStatusSchema = {
	height: Joi.number().integer().required(),
	finalizedHeight: Joi.number().integer().required(),
	milestone: Joi.array().required(),
	networkVersion: Joi.string().required(),
	networkIdentifier: Joi.string().required(),
	currentReward: Joi.number().required(),
	rewards: Joi.object().required(),
	registeredModules: Joi.array().required(),
	moduleAssets: Joi.array().required(),
	blockTime: Joi.number().required(),
	communityIdentifier: Joi.string().required(),
	minRemainingBalance: Joi.string().required(),
	maxPayloadLength: Joi.number().required(),
};

const metaSchema = {
	lastUpdate: Joi.number().integer().min(0).required(),
	lastBlockHeight: Joi.number().integer().min(0).required(),
	lastBlockId: Joi.string().min(1).required(),
};

module.exports = {
	networkStatusSchema: Joi.object(networkStatusSchema).required(),
	metaSchema: Joi.object(metaSchema).required(),
};
