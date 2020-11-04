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
const BluebirdPromise = require('bluebird');
const coreApi = require('./coreApi');
const {
	getUnixTime,
	getBlockchainTime,
	validateTimestamp,
} = require('../common');

const getTransactionsByBlock = async (block) => {
	const transactions = await coreApi.getTransactions({ height: block.height });
	transactions.data = await BluebirdPromise.map(
		transactions.data,
		async transaction => ({ ...transaction, timestamp: block.timestamp }),
		{ concurrency: transactions.data.length },
	);
	return transactions;
};

const getTransactions = async params => {
	let transactions = {
		data: [],
		meta: {},
		links: {},
	};

	await Promise.all(['fromTimestamp', 'toTimestamp'].map(async (timestamp) => {
		if (await validateTimestamp(params[timestamp])) {
			params[timestamp] = await getBlockchainTime(params[timestamp]);
		}
		return Promise.resolve();
	}));

	if (params.fromTimestamp || params.toTimestamp) {
		const blocks = await coreApi.getBlocks(params);
		transactions.meta.count = 0;
		await BluebirdPromise.map(
			blocks.data,
			async (block) => {
				const blkTransactions = await getTransactionsByBlock(block);
				transactions.data = transactions.data.concat(blkTransactions.data);
				transactions.meta.count += blkTransactions.meta.count;
			},
			{ concurrency: blocks.data.length },
		);
	} else {
		transactions = await coreApi.getTransactions(params);
		await BluebirdPromise.map(
			transactions.data,
			async transaction => {
				const txBlock = (await coreApi.getBlocks({ height: transaction.height })).data[0];
				transaction.timestamp = txBlock.timestamp;
				return transaction;
			},
			{ concurrency: transactions.data.length },
		);
	}

	if (transactions.data) {
		transactions.data = await BluebirdPromise.map(
			transactions.data,
			async transaction => ({
				...transaction, unixTimestamp: await getUnixTime(transaction.timestamp),
			}),
			{ concurrency: transactions.data.length },
		);
	}

	transactions.meta.total = transactions.meta.count;
	transactions.meta.count = transactions.data.length;
	transactions.meta.offset = params.offset || 0;

	return transactions;
};


const getPendingTransactions = async () => {
	const pendingTx = await coreApi.getPendingTransactions();
	return pendingTx;
};

module.exports = { getTransactions, getPendingTransactions };
