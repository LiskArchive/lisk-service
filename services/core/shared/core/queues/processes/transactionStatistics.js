// /*
//  * LiskHQ/lisk-service
//  * Copyright © 2019 Lisk Foundation
//  *
//  * See the LICENSE file at the top-level directory of this distribution
//  * for licensing information.
//  *
//  * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
//  * no part of this software, including this file, may be copied, modified,
//  * propagated, or distributed except according to the terms contained in the
//  * LICENSE file.
//  *
//  * Removal or modification of this copyright notice is prohibited.
//  *
//  */
const { fetchTransactions,
	computeTransactionStats,
	transformStatsObjectToList,
	insertToDb,
} = require('../../helpers/transactionStatistics');

module.exports = async (job) => {
	const { date } = job.data;
	if (!date) {
		return Promise.reject(new Error('Missing date'));
	}
	try {
		const transactions = await fetchTransactions(date);
		const statsObject = computeTransactionStats(transactions);
		const statsList = transformStatsObjectToList(statsObject);
		return insertToDb(statsList, date);
	} catch (err) {
		return Promise.reject(err);
	}
};
