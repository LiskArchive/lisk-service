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

const blockSchema = {
	id: Joi.string().required(),
	height: Joi.number().integer().min(0).required(),
	version: Joi.number().required(),
	timestamp: Joi.number().integer().min(1).required(),
	generatorAddress: Joi.string().allow('').required(),
	assetsRoot: Joi.string().required(),
	stateRoot: Joi.string().required(),
	transactionRoot: Joi.string().required(),
	previousBlockID: Joi.string().required(),
	signature: Joi.string().allow('').required(),
	aggregateCommit: Joi.object().required(),
	isFinal: Joi.boolean().required(),
	maxHeightGenerated: Joi.number().required(),
	maxHeightPrevoted: Joi.number().required(),
	validatorsHash: Joi.string().required(),
};

const block = {
	id: Joi.string().required(),
	height: Joi.number().required(),
	timestamp: Joi.number().required(),
};

const asset = {
	moduleID: Joi.string().required(),
	data: Joi.string().required(), // TODO: Update data schema once confirmed from sdk
};

const blockAssetSchema = {
	block: Joi.object(block).required(),
	assets: Joi.array().items(asset).required(),
};

module.exports = {
	blockSchema: Joi.object(blockSchema),
	blockAssetSchema: Joi.object(blockAssetSchema),
};
