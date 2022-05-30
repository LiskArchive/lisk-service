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
	name: Joi.string().optional(),
};

const block = {
	id: Joi.string().required(),
	height: Joi.number().required(),
	timestamp: Joi.number().required(),
};

const transactionSchema = {
	id: Joi.string().required(),
	moduleCommandID: Joi.string().required(),
	moduleCommandName: Joi.string().required(),
	fee: Joi.string().required(),
	height: Joi.number().integer().min(1).required(),
	nonce: Joi.string().optional(),
	confirmations: Joi.number().required(),
	params: Joi.object().required(),
	sender: Joi.object(sender).optional(),
	block: Joi.object(block).optional(),
	executionStatus: Joi.string().required(),
};

const postTransactionSchema = {
	transactionId: Joi.string().required(),
	message: Joi.string().valid('Transaction payload was successfully passed to the network node').required(),
};

module.exports = {
	transactionSchema: Joi.object(transactionSchema),
	postTransactionSchema: Joi.object(postTransactionSchema),
};
