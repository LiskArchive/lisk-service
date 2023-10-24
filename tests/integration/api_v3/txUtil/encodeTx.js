/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const {
	address: { getAddressFromLisk32Address },
} = require('@liskhq/lisk-cryptography');
const { validator } = require('@liskhq/lisk-validator');
const { api } = require('../../../helpers/api');

const { schemas } = require('./constants');

let metadata;

const getTransactionSchema = () => schemas.transaction;

const getTransactionParamsSchema = transaction => {
	const moduleMetadata = metadata.modules.find(m => m.name === transaction.module);
	const { params: schema } = moduleMetadata.commands.find(c => c.name === transaction.command);
	return schema;
};

const parseInputBySchema = (input, schema) => {
	const { type: schemaType, dataType: schemaDataType, items: schemaItemsSchema } = schema;

	if (typeof input !== 'object') {
		if (schemaDataType === 'string') return String(input);
		if (schemaDataType === 'boolean') return Boolean(input);
		if (schemaDataType === 'bytes') {
			if (schema.format === 'lisk32' && input.startsWith('lsk')) {
				return getAddressFromLisk32Address(input);
			}
			return Buffer.from(input, 'hex');
		}
		if (schemaDataType === 'uint32' || schemaDataType === 'sint32') return Number(input);
		if (schemaDataType === 'uint64' || schemaDataType === 'sint64') return BigInt(input);
		return input;
	}

	if (schemaType === 'object') {
		const formattedObj = Object.keys(input).reduce((acc, key) => {
			const { type, dataType, items: itemsSchema, format } = schema.properties[key] || {};
			const currValue = input[key];
			if (type === 'array') {
				acc[key] = currValue.map(item => parseInputBySchema(item, itemsSchema));
			} else {
				const innerSchema =
					typeof currValue === 'object' ? schema.properties[key] : { dataType, format };
				acc[key] = parseInputBySchema(currValue, innerSchema);
			}
			return acc;
		}, {});
		return formattedObj;
	}
	if (schemaType === 'array') {
		const formattedArray = input.map(item => parseInputBySchema(item, schemaItemsSchema));
		return formattedArray;
	}

	// For situations where the schema for a property states 'bytes'
	// but has already been de-serialized into object, e.g. tx.asset
	return input;
};

const encodeTransaction = async (transaction, endpoint) => {
	// Get metadata
	const metadataResponse = await api.request({
		method: 'post',
		maxBodyLength: Infinity,
		url: `${endpoint}/invoke`,
		headers: {
			'Content-Type': 'application/json',
		},
		data: JSON.stringify({
			endpoint: 'system_getMetadata',
		}),
	});
	metadata = metadataResponse.data;

	// Handle the transaction params
	const txParamsSchema = getTransactionParamsSchema(transaction);
	const txSchema = getTransactionSchema();

	const parsedTxParams = parseInputBySchema(transaction.params, txParamsSchema);
	const parsedTx = parseInputBySchema(transaction, txSchema);

	try {
		validator.validate(txParamsSchema, parsedTxParams);
	} catch (err) {
		throw new Error(err);
	}
	const txParamsBuffer = codec.encode(txParamsSchema, parsedTxParams);

	try {
		validator.validate(txSchema, { ...parsedTx, params: txParamsBuffer });
	} catch (err) {
		throw new Error(err);
	}

	const txBuffer = codec.encode(txSchema, { ...parsedTx, params: txParamsBuffer });

	return txBuffer.toString('hex');
};

module.exports = {
	encodeTransaction,
};
