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

const blockSchema = Joi.object({
	height: Joi.number().required(),
	id: Joi.string().required(),
	version: Joi.number().required(),
	payloadLength: Joi.number().required(),
	generatorAddress: Joi.string().required(),
	generatorPublicKey: Joi.string().required(),
	generatorUsername: Joi.string().required(),
	numberOfTransactions: Joi.number().required(),
	reward: Joi.string().required(),
	timestamp: Joi.number().required(),
	totalAmount: Joi.string().required(),
	totalFee: Joi.string().required(),
	totalForged: Joi.string().required(),
	payloadHash: Joi.string().required(),
	blockSignature: Joi.string().required(),
	confirmations: Joi.number().required(),
	previousBlockId: Joi.string().required(),
});

module.exports = blockSchema;
