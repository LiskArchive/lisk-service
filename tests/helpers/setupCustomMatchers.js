/*
 *
 *  * LiskHQ/lisk-service
 *  * Copyright © 2019 Lisk Foundation
 *  *
 *  * See the LICENSE file at the top-level directory of this distribution
 *  * for licensing information.
 *  *
 *  * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 *  * no part of this software, including this file, may be copied, modified,
 *  * propagated, or distributed except according to the terms contained in the
 *  * LICENSE file.
 *  *
 *  * Removal or modification of this copyright notice is prohibited.
 *  *
 *
 */
const mapRequiredSchema = (response, schema) => {
	let errors = '';
	Object.keys(schema).forEach(key => {
		if (!Object.prototype.hasOwnProperty.call(response, key)) {
			errors += `${key} is not present in response \n`;
		} else if (
			!['array', 'number', 'boolean', 'object', 'string', 'null'].some(type => type === schema[key])
		) {
			if (response[key] !== schema[key]) {
				errors += `${key}: ${response[key]} is not equal ${schema[key]}\n`;
			}
		} else if (
			schema[key] === 'array'
				? !Array.isArray(response[key])
				: !typeof response[key] === schema[key]
		) {
			errors += `${key}: ${response[key]} is not ${schema[key]}\n`;
		}
	});
	if (errors.length) {
		errors += `\nObject dump: ${JSON.stringify(response, null, 2)}\n`;
		return {
			pass: false,
			message: () => errors,
		};
	}
	return {
		pass: true,
	};
};

const mapOptionalSchema = (response, schema) => {
	let result;
	let errors = '';
	Object.keys(schema).forEach(key => {
		if (Object.prototype.hasOwnProperty.call(response, key)) {
			// eslint-disable-next-line valid-typeof
			if (typeof response[key] === schema[key]) {
				result = { pass: true };
			} else {
				errors += `${response[key]} is not ${schema[key]}\n`;
				errors += `\nObject dump: ${JSON.stringify(response, null, 2)}\n`;
			}
		}
	});
	if (errors.length) {
		return {
			pass: false,
			message: () => errors,
		};
	}
	return result;
};

const toMap = (response, schema, expectedValuesObject) => {
	const { error } = schema.validate(response);
	if (error) {
		return {
			pass: false,
			message: () => `Error: ${error}\n Object: ${JSON.stringify(response, null, 2)})`,
		};
	}
	let errors = '';
	if (expectedValuesObject) {
		Object.entries(expectedValuesObject).forEach(([key, value]) => {
			if (response && value !== response[key]) {
				errors += `${key}: ${response[key]} is not equal ${value}\n`;
				errors += `\nObject dump: ${JSON.stringify(response, null, 2)}\n`;
			}
		});
		if (errors.length) {
			return {
				pass: false,
				message: () => errors,
			};
		}
	}
	return {
		pass: true,
	};
};

expect.extend({
	toMapRequiredSchema: mapRequiredSchema,
	toMapOptionalSchema: mapOptionalSchema,
	toMap,
});
