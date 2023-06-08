/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const moment = require('moment');

const isObject = obj => !!(obj && obj.constructor.name === 'Object');
const isEmptyObj = obj => Object.entries(obj).length === 0 && obj.constructor === Object;
const isEmptyArr = obj => Array.isArray(obj) && obj.length === 0;
const validate = obj => !(isEmptyObj(obj) || isEmptyArr(obj));
const objWithValues = values => !(!values.some(value => value !== undefined));

const cast = {
	number: input => Number(input),
	string: input => String(input),
	boolean: input => ((input === '0') ? false : !!input),
	isodate: input => (new Date(input)).toISOString(),
	epoch: input => Date.parse(input) / 1000,
	datetime: input => moment(new Date(input)).utc().format('MM-DD-YYYY HH:mm:ss'),
	hex: input => (input ? (Buffer.from(input)).toString('hex') : undefined),
	base64: input => (input ? (Buffer.from(input)).toString('base64') : undefined),
};

// Retrieves value of a nested key inside an object. Returns undefined when not found.
const resolvePath = (obj, path) => {
	try {
		return path.split('.').reduce(
			(subObj, prop) => subObj && subObj[prop] !== undefined ? subObj[prop] : undefined,
			obj,
		);
	} catch (e) {
		return undefined;
	}
};

const mapObject = (rootObj, definition, subObj = rootObj) => Object.keys(definition)
	.reduce((acc, key) => {
		if (definition[key] !== null && typeof definition[key] === 'string') {
			const [path, type] = definition[key].split(',');
			const val = (path === '=') ? subObj[key] : resolvePath(rootObj, path);
			acc[key] = (val || val === 0) && type ? cast[type](val) : val;
		} else if (Array.isArray(definition[key])) {
			if (definition[key].length === 2) {
				const innerDef = definition[key][1];
				const dataSource = (definition[key][0] === '') ? rootObj : resolvePath(rootObj, definition[key][0]);
				if (Array.isArray(dataSource)) {
					const tempArr = [];
					dataSource.forEach(item => {
						if (validate(mapObject(item, innerDef))) tempArr.push(mapObject(item, innerDef));
					});
					acc[key] = tempArr;
				}
			} else if (definition[key].length === 1) {
				const innerDef = definition[key][0];
				const tempObj = mapObject(rootObj, innerDef, rootObj);
				if (validate(tempObj)) acc[key] = [tempObj];
			}
		} else if (typeof definition[key] === 'object' && rootObj[key] !== null) {
			const tempObj = mapObject(rootObj, definition[key], subObj[key]);
			const values = Object.values(tempObj);
			if (objWithValues(values) && validate(tempObj)) acc[key] = tempObj;
			else acc[key] = {};
		}
		return acc;
	}, {});

const mapArray = (rootObj, definition) => definition.reduce((acc, item, i) => {
	if (i === 0 && !isObject(item)) acc.push(item);
	if (i === 0 && isObject(item)) acc.push(mapObject(rootObj, item));
	if (i === 1 && isObject(item)) {
		acc.push(mapObject(rootObj, { [acc[i - 1]]: Object.values(item)[0] }));
	}
	return acc;
}, []);

/*
 * The Mapper always follows definition, which means
 * only fields described in the definition are processed.
 *
 * There are two main cases:
 *  - array mapping
 *  - object mapping
 *
 * The following assumptions are taken into account:
 *  - Each of them requires a different approach.
 *  - Nested object can access the global object.
 *  - Array narrows the access to the array scope.
 */
const map = (data, def) => {
	if (def === '=') return data;
	if (Array.isArray(def)) return mapArray(data, def);
	if (isObject(def)) return mapObject(data, def);
	return {};
};

module.exports = {
	mapper: map,

	// For testing
	resolvePath,
	mapObject,
	mapArray,
};
