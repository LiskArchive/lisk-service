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
	type: Joi.number().integer().min(0).max(15)
		.required(),
	height: Joi.number().integer().min(1).required(),
	nonce: Joi.string().optional(),
	blockId: Joi.string().required(),
	timestamp: Joi.number().integer().positive().required(),
	senderId: Joi.string().required(),
	senderPublicKey: Joi.string().required(),
	senderSecondPublicKey: Joi.string().optional(),
	recipientId: Joi.string().allow('').optional(),
	recipientPublicKey: Joi.string().allow('').optional(),
	signature: Joi.string().optional(),
	signSignature: Joi.string().optional(),
	signatures: Joi.array().items(Joi.string().optional()).required(),
	confirmations: Joi.number().integer().min(1).required(),
	asset: Joi.object().required(),
	receivedAt: Joi.string().optional(),
	relays: Joi.number().optional(),
	ready: Joi.boolean().optional(),
};

const sender = {
	address: Joi.string().required(),
	publicKey: Joi.string().required(),
	username: Joi.string().optional(),
};

const block = {
	id: Joi.string().required(),
	height: Joi.number().required(),
	timestamp: Joi.number().required(),
};

const transactionSchemaVersion5 = {
	id: Joi.string().required(),
	moduleAssetId: Joi.string().required(),
	moduleAssetName: Joi.string().required(),
	fee: Joi.string().required(),
	height: Joi.number().integer().min(1).required(),
	nonce: Joi.string().optional(),
	signatures: Joi.array().items(Joi.string().allow('').optional()).required(),
	asset: Joi.object().required(),
	sender: Joi.object(sender).optional(),
	block: Joi.object(block).optional(),
	isPending: Joi.boolean().required(),
};

const postTransactionSchema = {
	transactionId: Joi.string().required(),
	message: Joi.string().valid('Transaction payload was successfully passed to the network node').required(),
};

const pendingTransactionSchemaVersion5 = {
	id: Joi.string().required(),
	moduleAssetId: Joi.string().required(),
	moduleAssetName: Joi.string().required(),
	fee: Joi.string().required(),
	nonce: Joi.string().optional(),
	signatures: Joi.array().items(Joi.string().allow('').optional()).required(),
	asset: Joi.object().required(),
	sender: Joi.object(sender).optional(),
	isPending: Joi.boolean().required(),
};

module.exports = {
	transactionSchema: Joi.object(transactionSchema),
	transactionSchemaVersion5: Joi.object(transactionSchemaVersion5),
	postTransactionSchema: Joi.object(postTransactionSchema),
	pendingTransactionSchemaVersion5: Joi.object(pendingTransactionSchemaVersion5),
};
