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
// const {
// 	getUnixTime,
// 	getBlockchainTime,
// 	validateTimestamp,
// } = require("../common");

const getTransactionsByBlock = async (block) => {
	const transactions = await coreApi.getTransactions({ height: block.height });
	transactions.data.map((tx) => ({ ...tx, timestamp: block.timestamp }));
	return transactions;
};

const getTransactions = async (params) => {
	let transactions;

	const blocks = await coreApi.getBlocks(params);
	await blocks.data.map(async block => {
		const blockTransactions = await getTransactionsByBlock(block);
		transactions = transactions.concat(blockTransactions.data);
	});
	return transactions;
};

module.exports = { getTransactions };
