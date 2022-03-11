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
		const from = Number(params[property].split(':')[0]);
		const to = Number(params[property].split(':')[1]);
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
