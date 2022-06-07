/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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

const blockSchemaVersion5 = {
	id: Joi.string().required(),
	height: Joi.number().integer().min(0).required(),
	version: Joi.number().required(),
	timestamp: Joi.number().integer().min(1).required(),
	generatorAddress: Joi.string().optional(),
	generatorPublicKey: Joi.string().required(),
	generatorUsername: Joi.string().optional(),
	transactionRoot: Joi.string().required(),
	previousBlockId: Joi.string().required(),
	numberOfTransactions: Joi.number().integer().min(0).required(),
	signature: Joi.string().required(),
	totalFee: Joi.string().required(),
	reward: Joi.string().required(),
	totalForged: Joi.string().required(),
	totalBurnt: Joi.string().required(),
	isFinal: Joi.boolean().optional(),
	maxHeightPreviouslyForged: Joi.number().required(),
	maxHeightPrevoted: Joi.number().required(),
	seedReveal: Joi.string().required(),
};

module.exports = {
	blockSchemaVersion5: Joi.object(blockSchemaVersion5),
};
