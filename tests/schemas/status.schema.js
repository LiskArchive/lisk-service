/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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

const statusSchema = {
	build: Joi.string().required(),
	description: Joi.string().required(),
	name: Joi.string().required(),
	version: Joi.string().required(),
	networkID: Joi.string().required(),
	networkNodeVersion: Joi.string().optional(),
};

const services = {
	lisk_accounts: Joi.boolean().required(),
	lisk_blocks: Joi.boolean().required(),
	lisk_transactions: Joi.boolean().required(),
	// lisk_peers: Joi.boolean().required(),
	indexReadyStatus: Joi.boolean().required(),
	transactionStatsStatus: Joi.boolean().required(),
	feesStatus: Joi.boolean().required(),
	delegatesStatus: Joi.boolean().required(),
};

const readySchema = {
	services: Joi.object(services).required(),
};

module.exports = {
	statusSchema: Joi.object(statusSchema).required(),
	readySchema: Joi.object(readySchema).required(),
};
