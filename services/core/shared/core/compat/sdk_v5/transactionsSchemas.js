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
const coreApi = require('./coreApi');

const tempMethod = params => ({ ...params });

const getTransactionsSchemas = async params => {
	const transactionsSchemas = {
		data: [],
		meta: {},
	};

	tempMethod(params); // TODO: Remove

	const response = await coreApi.getTransactionsSchemas();
	if (response.data) transactionsSchemas.data = response.data;
	if (response.meta) transactionsSchemas.meta = response.meta;

	return transactionsSchemas;
};

module.exports = {
	getTransactionsSchemas,
};
