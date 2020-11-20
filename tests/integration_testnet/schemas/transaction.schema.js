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

const transactionSchema = {
	id: Joi.string().required(),
	amount: Joi.string().required(),
	fee: Joi.string().required(),
	type: Joi.number().integer().min(0).max(13).required(),
	height: Joi.number().required(),
	blockId: Joi.string().required(),
	timestamp: Joi.number().integer().required(),
	senderId: Joi.string().required(),
	senderPublicKey: Joi.string().required(),
	senderSecondPublicKey: Joi.string().optional(),
	recipientId: Joi.string().allow('').required(),
	recipientPublicKey: Joi.string().allow('').required(),
	signature: Joi.string().required(),
	signSignature: Joi.string().optional(),
	signatures: Joi.array().items(Joi.string().optional()).required(),
	confirmations: Joi.number().integer().min(1).required(),
	asset: Joi.object().required(), // TODO
	receivedAt: Joi.string().optional(), // TODO: Add validation
	relays: Joi.number().optional(),
	ready: Joi.boolean().optional(),
};

module.exports = {
	transactionSchema: Joi.object(transactionSchema),
};
