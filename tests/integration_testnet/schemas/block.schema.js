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

const blockSchema = {
	id: Joi.string().required(),
	height: Joi.number().integer().min(1).required(),
	version: Joi.number().required(),
	timestamp: Joi.number().integer().min(1).required(),
	generatorAddress: Joi.string().required(),
	generatorPublicKey: Joi.string().required(),
	generatorUsername: Joi.string().required(),
	payloadLength: Joi.number().integer().min(0).required(),
	payloadHash: Joi.string().required(),
	blockSignature: Joi.string().required(),
	confirmations: Joi.number().integer().min(0).required(),
	previousBlockId: Joi.string().required(),
	numberOfTransactions: Joi.number().integer().min(0).required(),
	totalAmount: Joi.string().required(),
	totalFee: Joi.string().required(),
	reward: Joi.string().required(),
	totalForged: Joi.string().required(),
	isFinal: Joi.boolean().optional(),
};

module.exports = {
	blockSchema: Joi.object(blockSchema),
};
