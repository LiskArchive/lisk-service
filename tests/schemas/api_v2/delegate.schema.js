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

const validDelegateStatuses = ['active', 'standby', 'banned', 'punished', 'ineligible'];

const pomHeightSchema = {
	start: Joi.number().required(),
	end: Joi.number().required(),
};

const delegateSchema = {
	address: Joi.string().required(),
	approval: Joi.string().optional(),
	delegateWeight: Joi.string().optional(),
	missedBlocks: Joi.number().integer().min(0).optional(),
	producedBlocks: Joi.number().integer().required(),
	productivity: Joi.string().required(),
	publicKey: Joi.string().required(),
	secondPublicKey: Joi.string().allow('').optional(),
	rank: Joi.number().integer().min(1).required(),
	rewards: Joi.string().required(),
	username: Joi.string().required(),
	vote: Joi.string().required(),
	totalVotesReceived: Joi.string().optional(),
	isBanned: Joi.boolean().optional(),
	status: Joi.string().valid(...validDelegateStatuses).required(),
	pomHeights: Joi.array().items(pomHeightSchema).optional(),
	lastForgedHeight: Joi.number().integer().optional(),
	consecutiveMissedBlocks: Joi.number().integer().optional(),
};

module.exports = {
	validDelegateStatuses,
	pomHeightSchema,
	delegateSchema: Joi.object(delegateSchema).required(),
};
