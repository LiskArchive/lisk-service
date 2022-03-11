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
} = require('lisk-service-framework');

const normalizeRangeParam = (params, property) => {
	if (typeof params[property] === 'string' && params[property].includes(':')) {
		const [fromStr, toStr] = params[property].split(':');
		
		const from = Number(fromStr);
		const to = Number(toStr);

		if (Number.isNaN(from) || Number.isNaN(to)) throw new ValidationException(`Invalid (non-numeric) '${property}' range values supplied: ${params[property]}.`);
		if (from && to && from > to) throw new ValidationException(`From ${property} cannot be greater than to ${property}.`);

		if (!params.propBetweens) params.propBetweens = [];
		params.propBetweens.push({ property, from, to });

		const normalizedParams = Object.keys(params).reduce(
			(acc, key) => {
				if (key !== property) acc[key] = params[key];
				return acc;
			},
			{},
		);
		return normalizedParams;
	}
	return params;
};

module.exports = {
	normalizeRangeParam,
};
