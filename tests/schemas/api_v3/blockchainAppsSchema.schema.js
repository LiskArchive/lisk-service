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

const validStatuses = ['registered', 'active', 'terminated', 'any'];

const goodRequestSchemaForStats = {
	data: Joi.object().required(),
	meta: Joi.object().optional(),
	links: Joi.object().optional(),
};

const blockchainAppsStatsSchema = {
	registered: Joi.number().integer().min(0).required(),
	active: Joi.number().integer().min(0).required(),
	terminated: Joi.number().integer().min(0).required(),
};

const blockchainAppSchema = {
	name: Joi.string().pattern(regex.NAME).required(),
	chainID: Joi.string().required(),
	state: Joi.string().valid(...validStatuses).required(),
	address: Joi.string().pattern(regex.ADDRESS_BASE32).required(),
	lastCertificateHeight: Joi.string().required(),
	lastUpdated: Joi.string().required(),
};

module.exports = {
	blockchainAppsStatsSchema: Joi.object(blockchainAppsStatsSchema).required(),
	blockchainAppSchema: Joi.object(blockchainAppSchema).required(),
	goodRequestSchemaForStats: Joi.object(goodRequestSchemaForStats).required(),
};
