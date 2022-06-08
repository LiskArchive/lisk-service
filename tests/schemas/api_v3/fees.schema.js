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

const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

const feeEstimateSchema = {
	feeEstimatePerByte: Joi.object({
		low: Joi.number().min(0).required(),
		medium: Joi.number().min(0).required(),
		high: Joi.number().min(0).required(),
	}).required(),
	baseFeeByID: Joi.object()
		.min(1)
		.pattern(regex.MODULE_ID, Joi.string().required())
		.required(),
	baseFeeByName: Joi.object()
		.min(1)
		.pattern(regex.MODULE_NAME, Joi.string().required())
		.required(),
	minFeePerByte: Joi.number().integer().required(),
};

const metaSchema = {
	lastUpdate: Joi.number().integer().min(0).max(getCurrentTimestamp())
		.required(),
	lastBlockHeight: Joi.number().integer().min(1).required(),
	lastBlockID: Joi.string().min(1).max(64).pattern(regex.HASH_SHA256)
		.required(),
};

const goodRequestSchema = {
	data: Joi.object().required(),
	meta: Joi.object().required(),
	links: Joi.object().optional(),
};

module.exports = {
	feeEstimateSchema: Joi.object(feeEstimateSchema).required(),
	metaSchema: Joi.object(metaSchema).required(),
	goodRequestSchema: Joi.object(goodRequestSchema).required(),
};
