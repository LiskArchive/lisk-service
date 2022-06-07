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

const networkStatusSchema = {
	version: Joi.string().required(),
	networkVersion: Joi.string().required(),
	networkIdentifier: Joi.string().required(),
	lastBlockID: Joi.string().required(),
	height: Joi.number().integer().min(0).required(),
	finalizedHeight: Joi.number().min(0).integer().required(),
	syncing: Joi.boolean().required(),
	unconfirmedTransactions: Joi.number().required(),
	genesis: Joi.object().required(),
	registeredModules: Joi.array().required(),
	moduleCommands: Joi.array().required(),
	network: Joi.object().required(),
};

const metaSchema = {
	lastUpdate: Joi.number().integer().min(0).required(),
	lastBlockHeight: Joi.number().integer().min(0).required(),
	lastBlockId: Joi.string().min(1).required(),
};

module.exports = {
	networkStatusSchema: Joi.object(networkStatusSchema).required(),
	metaSchema: Joi.object(metaSchema).required(),
};
