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
import { TRANSACTION_EXECUTION_STATUSES } from './constants/transactions';

const regex = require('./regex');

const sender = {
	address: Joi.string().pattern(regex.ADDRESS_LISK32).required(),
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY).required(),
	name: Joi.string().pattern(regex.NAME).allow(null).optional(),
};

const block = {
	id: Joi.string().pattern(regex.HASH_SHA256).required(),
	height: Joi.number().integer().min(1).required(),
	timestamp: Joi.number().integer().positive().required(),
	isFinal: Joi.boolean().required(),
};

const transactionMetaRecipientSchema = {
	address: Joi.string().pattern(regex.ADDRESS_LISK32).required(),
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY).allow(null).optional(),
	name: Joi.string().pattern(regex.NAME).allow(null).optional(),
};

const transactionMetaSchema = {
	recipient: Joi.object(transactionMetaRecipientSchema).required(),
};

const pendingTransactionSchema = {
	id: Joi.string().pattern(regex.HASH_SHA256).required(),
	moduleCommand: Joi.string().pattern(regex.MODULE_COMMAND).required(),
	nonce: Joi.string().required(),
	fee: Joi.string().required(),
	minFee: Joi.string().required(),
	size: Joi.number().integer().positive().required(),
	sender: Joi.object(sender).required(),
	params: Joi.object().required(),
	signatures: Joi.array()
		.items(Joi.string().pattern(regex.HASH_SHA512).allow('').required())
		.required(),
	executionStatus: Joi.string().valid('pending').required(),
	meta: Joi.object(transactionMetaSchema).optional(),
};

const transactionSchema = {
	...pendingTransactionSchema,
	block: Joi.object(block).required(),
	index: Joi.number().integer().min(0).required(),
	executionStatus: Joi.string()
		.valid(...TRANSACTION_EXECUTION_STATUSES.filter(status => status !== 'pending'))
		.required(),
};

const postTransactionSchema = {
	transactionID: Joi.string().required(),
	message: Joi.string()
		.valid('Transaction payload was successfully passed to the network node.')
		.required(),
};

module.exports = {
	transactionSchema: Joi.object(transactionSchema),
	pendingTransactionSchema: Joi.object(pendingTransactionSchema),
	postTransactionSchema: Joi.object(postTransactionSchema),
};
