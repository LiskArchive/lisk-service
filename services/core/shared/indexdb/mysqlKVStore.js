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
const { getTableInstance } = require('./mysql');

const keyValueStoreSchema = {
	primaryKey: 'key',
	schema: {
		key: { type: 'string' },
		value: { type: 'string' },
		type: { type: 'string' },
	},
	indexes: {
		key: { type: 'key' },
	},
	purge: {},
};

const ALLOWED_VALUE_TYPES = ['boolean', 'number', 'bigint', 'string', 'undefined'];

const getKeyValueStoreIndex = () => getTableInstance('key_value_store', keyValueStoreSchema);

const set = async (key, value) => {
	const keyValueDB = await getKeyValueStoreIndex();
	const type = typeof (value);

	if (!ALLOWED_VALUE_TYPES.includes(type)) {
		throw new Error(`Allowed 'value' types are: ${ALLOWED_VALUE_TYPES.join()}`);
	}

	const finalValue = value === undefined ? value : String(value);
	await keyValueDB.upsert({ key, value: finalValue, type });
};

const get = async (key) => {
	const keyValueDB = await getKeyValueStoreIndex();

	const [{ value, type } = {}] = await keyValueDB.find(
		{ key, limit: 1 },
		['value', 'type'],
	);

	// Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#description
	if (type === 'boolean') return Boolean(value);
	if (type === 'number') return Number(value);
	if (type === 'bigint') return BigInt(value);
	if (type === 'string') return String(value);

	// type: ['undefined', 'symbol', 'function', 'object']
	return value;
};

module.exports = {
	set,
	get,
};
