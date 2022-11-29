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
const { codec } = require('@liskhq/lisk-codec');
const { validator } = require('@liskhq/lisk-validator');
const {
	Logger,
	Exceptions: { InvalidParamsException },
} = require('lisk-service-framework');

const { parseInputBySchema } = require('../utils/parser');
const {
	getTransactionSchema,
	getTransactionParamsSchema,
} = require('./schema');

const logger = Logger();

const encodeTransaction = (transaction) => {
	// Handle the transaction params
	const txParamsSchema = getTransactionParamsSchema(transaction);
	const txSchema = getTransactionSchema();

	const parsedTxParams = parseInputBySchema(transaction.params, txParamsSchema);
	const parsedTx = parseInputBySchema(transaction, txSchema);

	try {
		validator.validate(txParamsSchema, parsedTxParams);
	} catch (err) {
		logger.warn(`Transaction params schema validation failed.\nError:${err}`);
		throw new InvalidParamsException(err);
	}
	const txParamsBuffer = codec.encode(txParamsSchema, parsedTxParams);

	try {
		validator.validate(txSchema, { ...parsedTx, params: txParamsBuffer });
	} catch (err) {
		logger.warn(`Transaction schema validation failed.\nError:${err}`);
		throw new InvalidParamsException(err);
	}

	const txBuffer = codec.encode(
		txSchema,
		{ ...parsedTx, params: txParamsBuffer },
	);

	return txBuffer.toString('hex');
};

module.exports = {
	encodeTransaction,
};
