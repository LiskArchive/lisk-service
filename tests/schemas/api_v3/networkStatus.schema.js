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

const moduleCommandSchema = {
	id: Joi.string().required(),
	name: Joi.string().required(),
};

const genesisSchema = {
	blockTime: Joi.number().integer().min(0).required(),
	communityIdentifier: Joi.string().required(),
	maxTransactionsSize: Joi.number().integer().min(0).required(),
	minFeePerByte: Joi.number().integer().min(0).required(),
	baseFees: Joi.array().required(),
	modules: Joi.object().required(),
};

const seedPeerSchema = {
	ip: Joi.string().pattern(regex.IP).required(),
	port: Joi.number().port().required(),
};

const networkSchema = {
	port: Joi.number().port().required(),
	seedPeers: Joi.array().items(seedPeerSchema).required(),
};

const networkStatusSchema = {
	version: Joi.string().pattern(regex.SEMVER).required(),
	networkVersion: Joi.string().required(),
	networkIdentifier: Joi.string().min(1).max(64).pattern(regex.HASH_SHA256)
		.required(),
	lastBlockID: Joi.string().min(1).max(64).pattern(regex.HASH_SHA256)
		.required(),
	height: Joi.number().integer().min(0).required(),
	finalizedHeight: Joi.number().min(0).integer().required(),
	syncing: Joi.boolean().required(),
	unconfirmedTransactions: Joi.number().integer().min(0).required(),
	genesis: Joi.object(genesisSchema).required(),
	registeredModules: Joi.array().items(Joi.string()).required(),
	moduleCommands: Joi.array().items(moduleCommandSchema).required(),
	network: Joi.object(networkSchema).required(),
};

const metaSchema = {
	lastUpdate: Joi.number().integer().min(0).max(getCurrentTimestamp())
		.required(),
	lastBlockHeight: Joi.number().integer().min(0).required(),
	lastBlockID: Joi.string().min(1).max(64).pattern(regex.HASH_SHA256)
		.required(),
};

module.exports = {
	networkStatusSchema: Joi.object(networkStatusSchema).required(),
	metaSchema: Joi.object(metaSchema).required(),
};
