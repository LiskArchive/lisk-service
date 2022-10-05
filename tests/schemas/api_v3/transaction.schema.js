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
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY).optional(),
	name: Joi.string().pattern(regex.NAME).allow(null).optional(),
};

const getCurrentTime = () => Math.floor(Date.now() / 1000);

const block = {
	id: Joi.string().pattern(regex.HASH_SHA256).required(),
	height: Joi.number().integer().min(1).required(),
	timestamp: Joi.number().integer().positive().max(getCurrentTime())
		.required(),
	isFinal: Joi.boolean().required(),
};

const transactionMetaReceipientSchema = {
	address: Joi.string().pattern(regex.ADDRESS_BASE32).required(),
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY).allow(null).required(),
	name: Joi.string().pattern(regex.NAME).allow(null).required(),
};

const transactionMetaSchema = {
	recipient: Joi.object(transactionMetaReceipientSchema).required(),
};

const TRANSACTION_EXECUTION_STATUSES = [
	'pending',
	'success',
	'fail',
];

const transactionSchema = {
	id: Joi.string().pattern(regex.HASH_SHA256).required(),
	moduleCommand: Joi.string().pattern(regex.MODULE_COMMAND).required(),
	nonce: Joi.string().required(),
	fee: Joi.string().required(),
	sender: Joi.object(sender).required(),
	params: Joi.object().required(),
	block: Joi.object(block).required(),
	executionStatus: Joi.string().valid(...TRANSACTION_EXECUTION_STATUSES).required(),
	meta: Joi.object(transactionMetaSchema).required(),
};

const postTransactionSchema = {
	transactionID: Joi.string().required(),
	message: Joi.string().valid('Transaction payload was successfully passed to the network node').required(),
};

module.exports = {
	transactionSchema: Joi.object(transactionSchema),
	postTransactionSchema: Joi.object(postTransactionSchema),
};
