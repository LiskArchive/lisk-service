/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
const { requestConnector } = require('../../utils/request');
const { TRANSACTION_VERIFY_RESULT } = require('../../constants');

const dryRunTransactions = async params => {
	const dryRunTransactionsRes = {
		data: [],
		meta: {},
	};
	const { transaction, skipVerify } = params;

	const response = await requestConnector('dryRunTransaction', { transaction, skipVerify });

	dryRunTransactionsRes.data = {
		...response,
		status: Object
			.keys(TRANSACTION_VERIFY_RESULT)
			.find(e => TRANSACTION_VERIFY_RESULT[e] === response.result),
	};
	dryRunTransactionsRes.meta = {};

	return dryRunTransactionsRes;
};

module.exports = {
	dryRunTransactions,
};
