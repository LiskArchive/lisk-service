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
import regex from './regex';

const allowedDateFormats = ['YYYY-MM-DD', 'YYYY-MM'];

const goodRequestSchema = {
	data: Joi.object().required(),
	meta: Joi.object().required(),
	links: Joi.object().optional(),
};

const timelineItemSchema = {
	timestamp: Joi.number().integer().positive().required(),
	date: Joi.string().required(),
	transactionCount: Joi.number().integer().min(0).required(),
	volume: Joi.number().integer().min(0).required(),
};

const timelineKey = Joi.string().pattern(regex.TOKEN_ID).required();
const timelineEntry = Joi.array().items(timelineItemSchema).required();

const transactionStatisticsSchema = {
	timeline: Joi.object().pattern(timelineKey, timelineEntry).required(),
	distributionByType: Joi.object().required(),
	distributionByAmount: Joi.object().required(),
};

const date = {
	dateFormat: Joi.string().valid(...allowedDateFormats).required(),
	dateFrom: Joi.string().required(),
	dateTo: Joi.string().required(),
};

const metaSchema = {
	limit: Joi.number().required(),
	offset: Joi.number().required(),
	total: Joi.number().required(),
	date: Joi.object(date).required(),
	info: Joi.object().optional(),
};

module.exports = {
	timelineItemSchema: Joi.object(timelineItemSchema).required(),
	transactionStatisticsSchema: Joi.object(transactionStatisticsSchema).required(),
	goodRequestSchema: Joi.object(goodRequestSchema).required(),
	metaSchema: Joi.object(metaSchema).required(),
};
