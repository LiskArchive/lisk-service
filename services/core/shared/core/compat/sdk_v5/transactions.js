/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const coreApi = require('./coreApi');

const getTransactions = async params => {
	const transactions = {
		data: [],
		meta: {},
	};

	const response = await coreApi.getTransactions(params);
	if (response.data) transactions.data = response.data;
	if (response.meta) transactions.meta = response.meta;

	transactions.meta.total = transactions.meta.count;
	transactions.meta.count = transactions.data.length;
	transactions.meta.offset = params.offset || 0;

	return transactions;
};

module.exports = { getTransactions };
