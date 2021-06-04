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

const voterSchema = {
	address: Joi.string().required(),
	amount: Joi.string().optional(),
	publicKey: Joi.string().required(),
	balance: Joi.string().required(),
	username: Joi.string().optional(),
};

const metaSchema = {
	count: Joi.number().integer().min(0).required(),
	limit: Joi.number().integer().min(0).optional(),
	total: Joi.number().integer().min(0).optional(),
	offset: Joi.number().integer().min(0).required(),
	address: Joi.string().required(),
	publicKey: Joi.string().optional(),
	username: Joi.string().optional(),
};

const account = {
	address: Joi.string().required(),
	username: Joi.string().optional(),
	votesReceived: Joi.number().required(),
};

const votes = {
	address: Joi.string().required(),
	username: Joi.string().optional(),
	amount: Joi.string().required(),
};

const voterSchemaVersion5 = {
	account: Joi.object(account).required(),
	votes: Joi.array().items(votes).optional(),
};

module.exports = {
	voterSchema: Joi.object(voterSchema).required(),
	voterSchemaVersion5: Joi.object(voterSchemaVersion5).required(),
	metaSchema: Joi.object(metaSchema).required(),
};
