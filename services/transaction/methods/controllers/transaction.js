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
	Exceptions: { ServiceUnavailableException },
} = require('lisk-service-framework');

const transactionService = require('../../shared/transaction');

const createMultisignatureTx = async inputTransaction => {
	const transaction = {
		data: [],
		meta: {},
	};

	try {
		const response = await transactionService.createMultisignatureTx(inputTransaction);
		if (response.data) transaction.data = response.data;
		if (response.meta) transaction.meta = response.meta;

		return transaction;
	} catch (err) {
		let status;
		if (err instanceof ServiceUnavailableException) status = 'SERVICE_UNAVAILABLE';
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

module.exports = {
	createMultisignatureTx,
};
