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
	const maxAmount = !firstRequest.meta.total || firstRequest.meta.total > defaultMaxAmount
		? defaultMaxAmount
		: firstRequest.meta.total;

	if (maxAmount > oneRequestLimit) {
		const pages = [...Array(Math.ceil(maxAmount / oneRequestLimit)).keys()];
		pages.shift();

		const collection = await pages.reduce((promise, page) => promise.then(() => fn(
			{
				...params,
				...{
					limit: oneRequestLimit,
					offset: oneRequestLimit * page,
				},
			})).then((result) => {
			result.data.forEach((item) => { data.push(item); });
			return data;
		}), Promise.resolve());
		return collection;
	}
	return data;
};

module.exports = requestAll;
