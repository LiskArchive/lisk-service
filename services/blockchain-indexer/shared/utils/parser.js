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
const { address: { getAddressFromLisk32Address } } = require('@liskhq/lisk-cryptography');

const parseToJSONCompatObj = obj => {
	if (typeof obj === 'boolean' || !obj) return obj;

	if (['string', 'number'].includes(typeof obj)) return obj;
	if (obj instanceof Buffer) return Buffer.from(obj).toString('hex');
	if (typeof obj === 'bigint') return String(obj);
	if (typeof obj === 'object' && Array.isArray(obj)) return (() => { obj.forEach((o, i) => obj[i] = parseToJSONCompatObj(o)); return obj; })();

	Object.entries(obj)
		.forEach(([k, v]) => {
			if (v instanceof Buffer) obj[k] = Buffer.from(v).toString('hex');
			else if (typeof v === 'bigint') obj[k] = String(v);
			else if (typeof v === 'object' && Array.isArray(v)) obj[k].forEach((o, i) => obj[k][i] = parseToJSONCompatObj(o));
			else if (typeof v === 'object' && v !== null) obj[k] = parseToJSONCompatObj(v);
			else obj[k] = v;
		});
	return obj;
};

const parseInputBySchema = (input, schema) => {
	const { type: schemaType, dataType: schemaDataType, items: schemaItemsSchema } = schema;

	if (typeof input !== 'object') {
		if (schemaDataType === 'string') return String(input);
		if (schemaDataType === 'boolean') return Boolean(input);
		if (schemaDataType === 'bytes') {
			if (schema.format === 'lisk32') { return getAddressFromLisk32Address(input); }
			return Buffer.from(input, 'hex');
		}
		if (schemaDataType === 'uint32' || schemaDataType === 'sint32') return Number(input);
		if (schemaDataType === 'uint64' || schemaDataType === 'sint64') return BigInt(input);
		return input;
	}

	if (schemaType === 'object') {
		const formattedObj = Object.keys(input).reduce((acc, key) => {
			const { type, dataType, items: itemsSchema } = schema.properties[key] || {};
			const currValue = input[key];
			if (type === 'array') {
				acc[key] = currValue.map(item => parseInputBySchema(item, itemsSchema));
			} else {
				const innerSchema = (typeof currValue === 'object') ? schema.properties[key] : { dataType };
				acc[key] = parseInputBySchema(currValue, innerSchema);
			}
			return acc;
		}, {});
		return formattedObj;
	} if (schemaType === 'array') {
		const formattedArray = input.map(item => parseInputBySchema(item, schemaItemsSchema));
		return formattedArray;
	}

	// For situations where the schema for a property states 'bytes'
	// but has already been de-serialized into object, e.g. tx.params
	return input;
};

module.exports = {
	parseToJSONCompatObj,
	parseInputBySchema,
};
