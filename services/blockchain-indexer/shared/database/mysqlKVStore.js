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
const { MySQL: { getTableInstance } } = require('lisk-service-framework');

const config = require('../../config');

const keyValueStoreSchema = require('./schema/kvStore');

const ALLOWED_VALUE_TYPES = ['boolean', 'number', 'bigint', 'string', 'undefined'];

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getKeyValueStoreIndex = () => getTableInstance(
	keyValueStoreSchema.tableName,
	keyValueStoreSchema,
	MYSQL_ENDPOINT,
);

const set = async (key, value, dbTrx) => {
	const keyValueDB = await getKeyValueStoreIndex();
	const type = typeof (value);

	if (!ALLOWED_VALUE_TYPES.includes(type)) {
		throw new Error(`Allowed 'value' types are: ${ALLOWED_VALUE_TYPES.join()}`);
	}

	const finalValue = value === undefined ? value : String(value);
	await keyValueDB.upsert({ key, value: finalValue, type }, dbTrx);
};

const formatValue = (value, type) => {
	// Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#description
	if (type === 'boolean') return Boolean(value);
	if (type === 'number') return Number(value);
	if (type === 'bigint') return BigInt(value);
	if (type === 'string') return String(value);
	if (type === 'undefined') return undefined;

	// type: ['symbol', 'function', 'object'], should be unreachable
	return value;
};

const get = async (key) => {
	const keyValueDB = await getKeyValueStoreIndex();

	const [{ value, type } = {}] = await keyValueDB.find(
		{ key, limit: 1 },
		['value', 'type'],
	);

	return formatValue(value, type);
};

const getByPattern = async (pattern) => {
	const keyValueDB = await getKeyValueStoreIndex();

	const result = await keyValueDB.find(
		{ search: { property: 'key', pattern } },
		['key', 'value', 'type'],
	);

	result.forEach(row => row.value = formatValue(row.value, row.type));
	return result;
};

const deleteEntry = async (key) => {
	const keyValueDB = await getKeyValueStoreIndex();
	return keyValueDB.deleteByPrimaryKey([key]);
};

module.exports = {
	set,
	get,
	getByPattern,
	delete: deleteEntry,
};
