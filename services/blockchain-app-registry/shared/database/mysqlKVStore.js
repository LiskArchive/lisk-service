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

const getKeyValueTable = () => getTableInstance(
	keyValueStoreSchema.tableName,
	keyValueStoreSchema,
	MYSQL_ENDPOINT,
);

const set = async (key, value, dbTrx) => {
	const keyValueTable = await getKeyValueTable();
	const type = typeof (value);

	if (!ALLOWED_VALUE_TYPES.includes(type)) {
		throw new Error(`Allowed 'value' types are: ${ALLOWED_VALUE_TYPES.join()}`);
	}

	const finalValue = value === undefined ? value : String(value);
	await keyValueTable.upsert({ key, value: finalValue, type }, dbTrx);
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
	const keyValueTable = await getKeyValueTable();

	const [{ value, type } = {}] = await keyValueTable.find(
		{ key, limit: 1 },
		['value', 'type'],
	);

	return formatValue(value, type);
};

const getByPattern = async (pattern) => {
	const keyValueTable = await getKeyValueTable();

	const result = await keyValueTable.find(
		{ search: { property: 'key', pattern } },
		['key', 'value', 'type'],
	);

	const formattedResult = result.map(row => ({
		key: row.key,
		value: formatValue(row.value, row.type),
	}));
	return formattedResult;
};

const deleteEntry = async (key, dbTrx) => {
	const keyValueTable = await getKeyValueTable();
	return keyValueTable.deleteByPrimaryKey([key], dbTrx);
};

module.exports = {
	set,
	get,
	getByPattern,
	delete: deleteEntry,
	// for testing
	formatValue,
};
