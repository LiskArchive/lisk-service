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

const sender = {
	address: Joi.string().pattern(/^lsk[a-hjkm-z2-9]{38}$/).required(),
	publicKey: Joi.string().pattern(/^([A-Fa-f0-9]{2}){32}$/).required(),
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
	moduleAssetId: Joi.string().min(1).max(21).required(),
	moduleAssetName: Joi.string().min(1).required(),
	fee: Joi.string().required(),
	nonce: Joi.string().required(),
	signatures: Joi.array().items(Joi.string().allow('').optional()).required(),
	asset: Joi.object().required(),
	sender: Joi.object(sender).optional(),
	isPending: Joi.boolean().required(),
};

module.exports = {
	transactionSchemaVersion5: Joi.object(transactionSchemaVersion5),
	postTransactionSchema: Joi.object(postTransactionSchema),
	pendingTransactionSchemaVersion5: Joi.object(pendingTransactionSchemaVersion5),
};
