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

import Joi from '@hapi/joi';

export const goodRequestSchema = Joi.object({
	data: Joi.array().required(),
	meta: Joi.object().required(),
	links: Joi.object().required(),
}).required();

export const metaSchema = Joi.object({
	count: Joi.number().required(),
	offset: Joi.number().required(),
	total: Joi.number().required(),
}).required();

export const badRequestSchema = Joi.object({
	code: Joi.number().required(),
	message: Joi.string().required(),
}).required();

export const delegateSchema = Joi.object({
	address: Joi.string(),
	publicKey: Joi.string(),
	approval: Joi.number(),
	missedBlocks: Joi.number(),
	producedBlocks: Joi.number(),
	productivity: Joi.string(),
	rank: Joi.number(),
	username: Joi.string(),
	vote: Joi.string(),
	rewards: Joi.string(),
	secondPublicKey: Joi.string().allow(''),
});

export const delegateListSchema = Joi.array().items(delegateSchema).required();
