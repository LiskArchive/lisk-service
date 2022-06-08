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
import regexValidators from './regexValidators';

const moduleCommand = {
	id: Joi.string().required(),
	name: Joi.string().required(),
};

const genesis = {
	blockTime: Joi.number().integer().min(0).required(),
	communityIdentifier: Joi.string().required(),
	maxTransactionsSize: Joi.number().integer().min(0).required(),
	minFeePerByte: Joi.number().integer().min(0).required(),
	baseFees: Joi.array().required(),
	modules: Joi.object().required(),
};

const seedPeer = {
	ip: Joi.string().pattern(regexValidators.ip).required(),
	port: Joi.number().port().required(),
};

const network = {
	port: Joi.number().port().required(),
	seedPeers: Joi.array().items(seedPeer).required(),
};

const networkStatusSchema = {
	version: Joi.string().pattern(regexValidators.version).required(),
	networkVersion: Joi.string().required(),
	networkIdentifier: Joi.string().min(1).max(64).pattern(regexValidators.id)
		.required(),
	lastBlockID: Joi.string().min(1).max(64).pattern(regexValidators.id)
		.required(),
	height: Joi.number().integer().min(0).required(),
	finalizedHeight: Joi.number().min(0).integer().required(),
	syncing: Joi.boolean().required(),
	unconfirmedTransactions: Joi.number().integer().min(0).required(),
	genesis: Joi.object(genesis).required(),
	registeredModules: Joi.array().items(Joi.string()).required(),
	moduleCommands: Joi.array().items(moduleCommand).required(),
	network: Joi.object(network).required(),
};

const metaSchema = {
	lastUpdate: Joi.number().integer().min(0).max(Date.now())
		.required(),
	lastBlockHeight: Joi.number().integer().min(0).required(),
	lastBlockID: Joi.string().min(1).max(64).pattern(regexValidators.id)
		.required(),
};

module.exports = {
	networkStatusSchema: Joi.object(networkStatusSchema).required(),
	metaSchema: Joi.object(metaSchema).required(),
};
