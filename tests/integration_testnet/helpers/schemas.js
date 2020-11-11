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

export const goodRequestSchema = Joi.object({
	data: Joi.array().required(),
	meta: Joi.object().required(),
}).required();

export const metaSchema = Joi.object({
	count: Joi.number().required(),
	offset: Joi.number().required(),
	total: Joi.number().required(),
}).required();

export const badRequestSchema = Joi.object({
	jsonrpc: Joi.string().required(),
	code: Joi.number().required(),
	message: Joi.string().required(),
}).required();

const pomHeightSchema = Joi.object({
	start: Joi.string().required(),
	end: Joi.string().required(),
});

export const delegateSchema = Joi.object({
	address: Joi.string(),
	approval: Joi.number().optional(),
	delegateWeight: Joi.string().optional(),
	missedBlocks: Joi.number(),
	producedBlocks: Joi.number(),
	productivity: Joi.string(),
	publicKey: Joi.string(),
	secondPublicKey: Joi.string().allow('').optional(),
	rank: Joi.number(),
	rewards: Joi.string(),
	username: Joi.string(),
	vote: Joi.string(),
	totalVotesReceived: Joi.string().optional(),
	isBanned: Joi.boolean().optional(),
	status: Joi.string(),
	pomHeights: Joi.array().items(pomHeightSchema).optional(),
	lastForgedHeight: Joi.number().optional(),
	consecutiveMissedBlocks: Joi.number().optional(),
});

export const delegateListSchema = Joi.array().items(delegateSchema).required();
