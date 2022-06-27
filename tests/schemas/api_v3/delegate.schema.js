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

const DELEGATE_STATUSES = [
	'active',
	'standby',
	'punished',
	'banned',
	'ineligible',
];

const pomHeightsSchema = {
	start: Joi.number().integer().positive().min(1)
		.required(),
	end: Joi.number().integer().positive().min(1)
		.required(),
};

const delegateSchema = {
	name: Joi.string().pattern(regex.NAME).required(),
	totalVotesReceived: Joi.string().min(10).required(),
	selfVotes: Joi.string().min(10).required(),
	voteWeight: Joi.string().min(10).required(),
	address: Joi.string().pattern(regex.ADDRESS_BASE32).required(),
	lastGeneratedHeight: Joi.number().integer().positive().min(1)
		.required(),
	status: Joi.string().valid(...DELEGATE_STATUSES).required(),
	isBanned: Joi.boolean().required(),
	pomHeights: Joi.array().items(pomHeightsSchema).required(),
	consecutiveMissedBlocks: Joi.number().integer().positive().min(0)
		.required(),
};

module.exports = {
	delegateSchema: Joi.object(delegateSchema),
};
