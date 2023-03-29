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
const {
	Exceptions: { ValidationException },
	Utils,
} = require('lisk-service-framework');

const normalizeRangeParam = (params, property) => {
	if (!params || !Utils.isObject(params)) return params;

	const EMPTY_STRING = '';

	// Create a copy to avoid implicit parameter modification
	const propBetweens = Array.isArray(params.propBetweens) ? [...params.propBetweens] : [];

	if (typeof params[property] === 'string' && params[property].includes(':')) {
		const [fromStr, toStr] = params[property].split(':');

		const from = Number(fromStr);
		const to = Number(toStr);

		if (Number.isNaN(from) || Number.isNaN(to)) throw new ValidationException(`Invalid (non-numeric) '${property}' range values supplied: ${params[property]}.`);
		if (fromStr && toStr && from > to) throw new ValidationException(`From ${property} cannot be greater than to ${property}.`);

		if (fromStr === EMPTY_STRING) {
			propBetweens.push({ property, to });
		} else if (toStr === EMPTY_STRING) {
			propBetweens.push({ property, from });
		} else {
			propBetweens.push({ property, from, to });
		}

		const paramsWithoutProperty = Object.keys(params).reduce(
			(acc, key) => {
				if (key !== property) acc[key] = params[key];
				return acc;
			},
			{},
		);
		return {
			...paramsWithoutProperty,
			propBetweens,
		};
	}
	return params;
};

module.exports = {
	normalizeRangeParam,
};
