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
const { getTableInstance } = require('../database/mysql');

const transactionsIndexSchema = require('../indexer/schema/transactions');

const getTransactionsIndex = () => getTableInstance('transactions', transactionsIndexSchema);

const getTransactionsByBlockIDs = async blockIDs => {
	const transactionsDB = await getTransactionsIndex();
	const transactions = await transactionsDB.find({
		whereIn: {
			property: 'blockId',
			values: blockIDs,
		},
	}, ['id']);
	const transactionsIds = transactions.map(t => t.id);
	return transactionsIds;
};

module.exports = {
	getTransactionsByBlockIDs,
};
