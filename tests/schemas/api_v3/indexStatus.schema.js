/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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

const getCurrentTime = () => Math.floor(Date.now() / 1000);

const indexStatusResponseSchema = {
	genesisHeight: Joi.number().integer().min(0),
	lastBlockHeight: Joi.number().integer().min(0),
	lastIndexedBlockHeight: Joi.number().integer().min(0),
	chainLength: Joi.number().integer().positive().min(1),
	numBlocksIndexed: Joi.number().integer().min(0),
	percentageIndexed: Joi.number().min(0),
	isIndexingInProgress: Joi.boolean(),
};

const indexStatusMetaResponseSchema = {
	lastUpdate: Joi.number().integer().positive().max(getCurrentTime())
		.required(),
};

const goodResponseSchema = {
	data: Joi.object(indexStatusResponseSchema).required(),
	meta: Joi.object(indexStatusMetaResponseSchema).required(),
};

module.exports = {
	goodResponseSchema: Joi.object(goodResponseSchema).required(),
};
