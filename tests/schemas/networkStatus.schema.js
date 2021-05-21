/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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

const feeSchema = {
	send: Joi.string().required(),
	vote: Joi.string().required(),
	secondSignature: Joi.string().required(),
	delegate: Joi.string().required(),
	multisignature: Joi.string().required(),
	dappRegistration: Joi.string().required(),
	dappWithdrawal: Joi.string().required(),
	dappDeposit: Joi.string().required(),
};

const networkStatusSchema = {
	broadhash: Joi.string().required(),
	height: Joi.number().integer().min(1).required(),
	networkHeight: Joi.number().integer().min(1).required(),
	epoch: Joi.string().required(),
	milestone: Joi.string().required(),
	nethash: Joi.string().required(),
	supply: Joi.string().required(),
	reward: Joi.string().required(),
	fees: Joi.object(feeSchema).required(),
};

const networkStatusSchemaVersion5 = {
	height: Joi.string().required(),
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

module.exports = {
	networkStatusSchema: Joi.object(networkStatusSchema).required(),
	networkStatusSchemaVersion5: Joi.object(networkStatusSchemaVersion5).required(),
};
