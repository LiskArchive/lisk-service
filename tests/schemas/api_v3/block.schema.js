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

const EMPTY_STRING = '';

const generator = {
	address: Joi.string().pattern(regex.ADDRESS_LISK32).required(),
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY).allow(null).optional(),
	name: Joi.string().pattern(regex.NAME).optional(),
};

const aggregateCommit = {
	height: Joi.number().integer().min(0).required(),
	aggregationBits: Joi.string().allow(EMPTY_STRING).required(),
	certificateSignature: Joi.string().allow(EMPTY_STRING).required(),
};

const blockSchema = {
	id: Joi.string().pattern(regex.HASH_SHA256).required(),
	height: Joi.number().integer().min(0).required(),
	version: Joi.number().required(),
	timestamp: Joi.number().integer().min(1).required(),
	generator: Joi.object(generator).required(),
	assetRoot: Joi.string().pattern(regex.HASH_SHA256).required(),
	stateRoot: Joi.string().pattern(regex.HASH_SHA256).required(),
	transactionRoot: Joi.string().pattern(regex.HASH_SHA256).required(),
	previousBlockID: Joi.string().pattern(regex.HASH_SHA256).required(),
	signature: Joi.string().allow('').pattern(regex.HASH_SHA512).required(),
	aggregateCommit: Joi.object(aggregateCommit).required(),
	isFinal: Joi.boolean().required(),
	reward: Joi.string().required(),
	networkFee: Joi.string().required(),
	totalForged: Joi.string().required(),
	totalBurnt: Joi.string().required(),
	maxHeightGenerated: Joi.number().required(),
	maxHeightPrevoted: Joi.number().required(),
	validatorsHash: Joi.string().pattern(regex.HASH_SHA256).required(),
	numberOfTransactions: Joi.number().integer().min(0).required(),
	numberOfAssets: Joi.number().integer().min(1).required(),
	numberOfEvents: Joi.number().integer().min(0).required(),
};

const block = {
	id: Joi.string().required(),
	height: Joi.number().required(),
	timestamp: Joi.number().required(),
};

const asset = {
	module: Joi.string().required(),
	data: Joi.object().required(),
};

const blockAssetSchema = {
	block: Joi.object(block).required(),
	assets: Joi.array().items(asset).required(),
};

module.exports = {
	blockSchema: Joi.object(blockSchema),
	blockAssetSchema: Joi.object(blockAssetSchema),
};
