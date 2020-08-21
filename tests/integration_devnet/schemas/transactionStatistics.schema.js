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
	data: Joi.object().required(),
	meta: Joi.object().required(),
	links: Joi.object().required(),
});

export const dataSchema = Joi.object({
	timeline: Joi.array().required(),
	distributionByType: Joi.object().required(),
	distributionByAmount: Joi.object().required(),
});

export const metaSchema = Joi.object({
	limit: Joi.number().required(),
	offset: Joi.number().required(),
	dateFormat: Joi.string().required(),
	dateFrom: Joi.string().required(),
	dateTo: Joi.string().required(),
});

export const timelineItemSchema = Joi.object({
	volume: Joi.number().required(),
	transactionCount: Joi.number().required(),
	timestamp: Joi.number().required(),
	date: Joi.string().required(),
}).required();
