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

const regex = require('./regex');

const sender = {
	address: Joi.string().pattern(regex.ADDRESS_BASE32).required(),
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY).required(),
	name: Joi.string().optional(),
};

const block = {
	id: Joi.string().required(),
	height: Joi.number().required(),
	timestamp: Joi.number().required(),
};

const TRANSACTION_EXECUTION_STATUSES = [
	'pending',
	'succeeded',
	'failed',
];

const transactionSchema = {
	id: Joi.string().required(),
	moduleCommandID: Joi.string().required(),
	moduleCommandName: Joi.string().required(),
	fee: Joi.string().required(),
	height: Joi.number().integer().min(1).required(),
	nonce: Joi.string().required(),
	confirmations: Joi.number().required(),
	params: Joi.object().required(),
	sender: Joi.object(sender).required(),
	block: Joi.object(block).required(),
	executionStatus: Joi.string().valid(...TRANSACTION_EXECUTION_STATUSES).required(),
};

const postTransactionSchema = {
	transactionID: Joi.string().required(),
	message: Joi.string().valid('Transaction payload was successfully passed to the network node').required(),
};

module.exports = {
	transactionSchema: Joi.object(transactionSchema),
	postTransactionSchema: Joi.object(postTransactionSchema),
};
