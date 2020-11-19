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

const basicNetworkStatisticsSchema = {
	connectedPeers: Joi.number().integer().positive().required(),
	disconnectedPeers: Joi.number().integer().positive().required(),
	totalPeers: Joi.number().integer().positive().required(),
};

const networkStatisticsSchema = {
	basic: Joi.object(basicNetworkStatisticsSchema).required(),
	height: Joi.object().min(1).required()
		.pattern(
			Joi.string().pattern(/^[0-9]+$/).required(),
			Joi.number().integer().positive().required()),
	coreVer: Joi.object().min(1).required()
		.pattern(
			Joi.string().required()
				.pattern(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/),
			Joi.number().integer().positive().required()),
	os: Joi.object().min(1).required()
		.pattern(
			Joi.string().pattern(/^[a-zA-Z0-9.]+$/).required(),
			Joi.number().integer().positive().required()),
};

const goodRequestSchema = {
	data: Joi.object(networkStatisticsSchema).required(),
	meta: Joi.object().required(),
	links: Joi.object().optional(),
};

module.exports = {
	goodRequestSchema: Joi.object(goodRequestSchema).required(),
	networkStatisticsSchema: Joi.object(networkStatisticsSchema).required(),
};
