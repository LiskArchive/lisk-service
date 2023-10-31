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

const { metaSchema } = require('../generics.schema');

const validStatuses = ['registered', 'activated', 'terminated', 'any'];
const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

const goodRequestSchemaForStats = {
	data: Joi.object().required(),
	meta: Joi.object().optional(),
	links: Joi.object().optional(),
};

const blockchainAppsStatsSchema = {
	registered: Joi.number().integer().min(0).required(),
	activated: Joi.number().integer().min(0).required(),
	terminated: Joi.number().integer().min(0).required(),
	totalSupplyLSK: Joi.string().required(),
	totalStakedLSK: Joi.string().required(),
	currentAnnualInflationRate: Joi.string().required(),
};

const escrow = {
	tokenID: Joi.string().pattern(regex.TOKEN_ID).required(),
	amount: Joi.string().pattern(regex.DIGITS).required(),
};

const dataSchema = {
	chainName: Joi.string().pattern(regex.CHAIN_NAME).required(),
	chainID: Joi.string().pattern(regex.CHAIN_ID).required(),
	status: Joi.string()
		.valid(...validStatuses)
		.required(),
	address: Joi.string().pattern(regex.ADDRESS_LISK32).required(),
	lastCertificateHeight: Joi.number().integer().min(0).required(),
	escrowedLSK: Joi.string().pattern(regex.DIGITS).required(),
	lastUpdated: Joi.number().integer().positive().max(getCurrentTimestamp()).required(),
	escrow: Joi.array().items(escrow).min(1).required(),
};

const blockchainAppsSchema = {
	data: Joi.array().items(dataSchema).required(),
	meta: metaSchema,
};

module.exports = {
	blockchainAppsStatsSchema: Joi.object(blockchainAppsStatsSchema).required(),
	blockchainAppsSchema: Joi.object(blockchainAppsSchema).required(),
	goodRequestSchemaForStats: Joi.object(goodRequestSchemaForStats).required(),
};
