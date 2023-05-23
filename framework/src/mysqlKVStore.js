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
const { getTableInstance } = require('./mysql');
const keyValueStoreSchema = require('./schema/kvStore');
const Logger = require('./logger').get;

const logger = Logger();

const CONN_ENDPOINT_DEFAULT = 'mysql://lisk:password@localhost:3306/lisk';
const KV_STORE_ALLOWED_VALUE_TYPES = ['boolean', 'number', 'bigint', 'string', 'undefined'];

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

const getKeyValueTable = async (connEndpoint = CONN_ENDPOINT_DEFAULT, prefix = 'default') => {
	const keyValueTable = await getTableInstance(keyValueStoreSchema, connEndpoint);

	const set = async (key, value, dbTrx) => {
		const type = typeof (value);

		if (!KV_STORE_ALLOWED_VALUE_TYPES.includes(type)) {
			logger.error(`Allowed 'value' types are: ${KV_STORE_ALLOWED_VALUE_TYPES.join()}`);
		}

		const finalValue = value === undefined ? value : String(value);
		await keyValueTable.upsert({ key: `${prefix}_${key}`, value: finalValue, type }, dbTrx);
	};

	const get = async (key, dbTrx) => {
		const [{ value, type } = {}] = await keyValueTable.find(
			{ key: `${prefix}_${key}`, limit: 1 },
			['value', 'type'],
			dbTrx,
		);

		return formatValue(value, type);
	};

	const getByPattern = async pattern => {
		const result = await keyValueTable.find(
			{ search: { property: 'key', pattern } },
			['key', 'value', 'type'],
		);

		const formattedResult = result.map(row => ({
			key: row.key.slice(prefix.length + 1),
			value: formatValue(row.value, row.type),
		}));
		return formattedResult;
	};

	const deleteEntry = async (key, dbTrx) => keyValueTable.deleteByPrimaryKey([`${prefix}_${key}`], dbTrx);

	return {
		set,
		get,
		getByPattern,
		delete: deleteEntry,
	};
};

module.exports = {
	getKeyValueTable,

	// Testing
	formatValue,
};
