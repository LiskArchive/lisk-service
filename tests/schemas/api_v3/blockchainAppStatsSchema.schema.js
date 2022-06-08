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

const goodRequestSchema = {
	data: Joi.object().required(),
	meta: Joi.object().optional(),
	links: Joi.object().optional(),
};

const blockchainAppStatsSchema = {
	registered: Joi.number().integer().min(0).required(),
	active: Joi.number().integer().min(0).required(),
	terminated: Joi.number().integer().min(0).required(),
};

module.exports = {
	blockchainAppStatsSchema: Joi.object(blockchainAppStatsSchema).required(),
	goodRequestSchema: Joi.object(goodRequestSchema).required(),
};
