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

const forgerSchema = {
	address: Joi.string().required(),
	username: Joi.string().optional(), // in CI, all accounts are not indexed
	totalVotesReceived: Joi.string().optional(), // in CI, all accounts are not indexed
	minActiveHeight: Joi.number().integer().required(),
	isConsensusParticipant: Joi.boolean().required(),
	nextForgingTime: Joi.number().integer().required(),
};

module.exports = {
	forgerSchema: Joi.object(forgerSchema).required(),
};
