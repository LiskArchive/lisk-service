/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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

const MapperService = (data, def) => {
	const isObject = obj => !!(obj && obj.constructor.name === 'Object');
	const isEmptyObj = obj => Object.entries(obj).length === 0 && obj.constructor === Object;
	const isEmptyArr = obj => Array.isArray(obj) && obj.length === 0;
	const validate = obj => !(isEmptyObj(obj) || isEmptyArr(obj));

	const cast = {
		number: input => Number(input),
		string: input => String(input),
		boolean: input => ((input === '0') ? false : !!input),
		isodate: input => (new Date(input)).toISOString(),
		datetime: input => moment(new Date(input)).utc().format('MM-DD-YYYY HH:mm:ss'),
		hex: input => (input ? (new Buffer.from(input)).toString('hex') : undefined),
		base64: input => (input ? (new Buffer.from(input)).toString('base64') : undefined),
	};

	const resolvePath = (obj, path) => {
		if (typeof path !== 'string' || !isObject(obj)) return undefined;
		const [firstPath, secondPath] = path.split('.');
		return secondPath ? obj[firstPath][secondPath] : obj[firstPath];
	};

	const mapObject = (rootObj, definition, subObj = rootObj) => Object.keys(definition).reduce(
		(acc, key) => {
			if (definition[key] !== null && typeof definition[key] === 'string') {
				const [path, type] = definition[key].split(',');
				const val = (path === '=') ? subObj[key] : resolvePath(rootObj, path);
				acc[key] = val !== undefined && type ? cast[type](val) : val;
			} else if (Array.isArray(definition[key])) {
				if (definition[key].length === 2) {
					const innerDef = definition[key][1];
					const dataSource = (definition[key][0] === '') ? rootObj : resolvePath(rootObj, definition[key][0]);
					if (Array.isArray(dataSource)) {
						const tempArr = [];
						dataSource.forEach((item) => {
							if (validate(mapObject(item, innerDef))) tempArr.push(mapObject(item, innerDef));
						});
						if (!isEmptyArr(tempArr)) acc[key] = tempArr;
					}
				} else if (definition[key].length === 1) {
					const innerDef = definition[key][0];
					const tempObj = mapObject(rootObj, innerDef, rootObj);
					if (validate(tempObj)) acc[key] = [tempObj];
				}
			} else if (typeof definition[key] === 'object' && rootObj[key] !== null) {
				const tempObj = mapObject(rootObj, definition[key], subObj[key]);
				if (validate(tempObj)) acc[key] = tempObj;
			}
			return acc;
		}, {});

	const mapToArray = (rootObj, definition) => definition.reduce((acc, item, i) => {
		if (i === 0 && !isObject(item)) acc.push(item);
		if (i === 0 && isObject(item)) acc.push(mapObject(rootObj, item));
		if (i === 1 && isObject(item)) {
			acc.push(mapObject(rootObj, { [acc[i - 1]]: Object.values(item)[0] }));
		}
		return acc;
	}, []);

	return Array.isArray(def) ? mapToArray(data, def) : mapObject(data, def);
};

module.exports = MapperService;
