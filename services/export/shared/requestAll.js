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
/* 	Executes a function until it returns at least limit amount or data or runs out of data
	and returns the appended result
*/
const requestAll = async (fn, params, limit) => {
	const defaultMaxAmount = limit || 1000;
	const oneRequestLimit = params.limit || 100;
	const firstRequest = await fn({
		...params,
		...{
			limit: oneRequestLimit,
			offset: 0,
		},
	});
	const { data } = firstRequest;
	if (data.error && data.error.includes('Not found')) return [];
	const maxAmount = !firstRequest.meta.total || firstRequest.meta.total > defaultMaxAmount
		? defaultMaxAmount
		: firstRequest.meta.total;

	if (maxAmount > oneRequestLimit) {
		for (let page = 1; page < Math.ceil(maxAmount / oneRequestLimit); page++) {
			/* eslint-disable no-await-in-loop */
			const result = await fn({
				...params,
				...{
					limit: oneRequestLimit,
					offset: oneRequestLimit * page,
				},
			});
			if (!result.data.length) break;
			data.push(...result.data);
			/* eslint-enable no-await-in-loop */
		}
	}
	return data;
};

module.exports = requestAll;
