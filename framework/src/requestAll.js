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
const { isEmptyArray, isObject, isEmptyObject } = require('./data');

const requestAll = async (fn, params, limit) => {
	const maxAmount = limit || 1e9;
	const oneRequestLimit = params.limit || 100;
	const firstRequest = await fn({
		...params,
		...{
			limit: oneRequestLimit,
			offset: 0,
		},
	});
	const totalResponse = firstRequest;
	if (!totalResponse.error) {
		if (maxAmount > oneRequestLimit) {
			for (let page = 1; page < Math.ceil(maxAmount / oneRequestLimit); page++) {
				const curOffset = oneRequestLimit * page;

				/* eslint-disable-next-line no-await-in-loop */
				const result = await fn({
					...params,
					...{
						limit: Math.min(oneRequestLimit, maxAmount - curOffset),
						offset: curOffset,
					},
				});

				// This check needs to be updated for dynamic exit based on emptiness of object properties
				if (!result || isEmptyArray(result) || isEmptyObject(result)) {
					break;
				}

				if (Array.isArray(totalResponse)) totalResponse.push(...result);
				else if (isObject(totalResponse)) {
					// When response is an object, we should traverse the properties and merge the values.
					// We can safely assume that the properties would be of type array, so concatenation will
					// result in the whole response. If property is not an array, the latest value is kept.
					Object.entries(totalResponse).forEach(
						([dataKey, dataVal]) => {
							if (Array.isArray(dataVal)) {
								totalResponse[dataKey].push(...result[dataKey]);
							} else if (isObject(dataVal)) {
								totalResponse[dataKey] = { ...totalResponse[dataKey], ...result[dataKey] };
							} else {
								totalResponse[dataKey] = result[dataKey];
							}
						});
				}
			}
		}
	}
	return totalResponse;
};

module.exports = requestAll;
