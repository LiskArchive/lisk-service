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

const genesisBlockSchema = {
	fromFile: Joi.string().required(),
};

const genesisSchema = {
	block: Joi.object(genesisBlockSchema).required(),
	bftBatchSize: Joi.number().integer().positive().required(),
	blockTime: Joi.number().integer().positive().required(),
	chainID: Joi.string().pattern(regex.CHAIN_ID).required(),
	minimumCertifyHeight: Joi.number().integer().min(1).required(),
	maxTransactionsSize: Joi.number().integer().positive().required(),
};

const seedPeerSchema = {
	ip: Joi.string().pattern(regex.IP).required(),
	port: Joi.number().port().required(),
};

const networkSchema = {
	version: Joi.string().required(),
	port: Joi.number().port().required(),
	seedPeers: Joi.array().items(seedPeerSchema).required(),
};

const networkStatusSchema = {
	version: Joi.string().pattern(regex.SEMVER).required(),
	networkVersion: Joi.string().required(),
	chainID: Joi.string().pattern(regex.CHAIN_ID).required(),
	lastBlockID: Joi.string().pattern(regex.HASH_SHA256).required(),
	height: Joi.number().integer().min(0).required(),
	finalizedHeight: Joi.number().min(0).integer().required(),
	syncing: Joi.boolean().required(),
	unconfirmedTransactions: Joi.number().integer().min(0).required(),
	genesis: Joi.object(genesisSchema).required(),
	genesisHeight: Joi.number().integer().min(0).required(),
	registeredModules: Joi.array().items(Joi.string()).required(),
	moduleCommands: Joi.array().items(Joi.string().pattern(regex.MODULE_COMMAND)).required(),
	network: Joi.object(networkSchema).required(),
};

const metaSchema = {
	lastUpdate: Joi.number().integer().min(0).required(),
	lastBlockHeight: Joi.number().integer().min(0).required(),
	lastBlockID: Joi.string().min(1).max(64).pattern(regex.HASH_SHA256).required(),
};

module.exports = {
	networkStatusSchema: Joi.object(networkStatusSchema).required(),
	metaSchema: Joi.object(metaSchema).required(),
};
