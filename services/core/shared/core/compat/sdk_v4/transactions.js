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
const { CacheRedis } = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');
const coreApi = require('./coreApi');
const signals = require('../../../signals');
const {
	getBlockchainTime,
	validateTimestamp,
	getUnixTime,
} = require('../common');

const config = require('../../../../config');
const redis = require('../../../redis');

const { mapParams } = require('./mappings');

const MAX_TX_LIMIT_PP = 100;

const bIdCache = CacheRedis('blockIdToTimestamp', config.endpoints.redis);
// const bHeightCache = CacheRedis('blockHeightToTimestamp', config.endpoints.redis);

// const getTransactionsByBlockHeight = (height) => coreApi.getTransactions({ height });
const getTransactionsByBlockId = (blockId) => coreApi.getTransactions({ blockId });

const addToIndex = async (tx) => {
	const { id, type, senderId, recipientId, timestamp, blockId } = tx;

	const sndAddrIndex = await redis(`trx:address:${senderId}`, ['timestamp']);
	await sndAddrIndex.writeRange(timestamp, id);

	const senderIndex = await redis(`trx:sender:${senderId}`, ['timestamp']);
	await senderIndex.writeRange(timestamp, id);

	if (recipientId) {
		const rcpAddrIndex = await redis(`trx:address:${recipientId}`, ['timestamp']);
		await rcpAddrIndex.writeRange(timestamp, id);

		const recipientIndex = await redis(`trx:recipient:${recipientId}`, ['timestamp']);
		await recipientIndex.writeRange(timestamp, id);
	}

	if (type === 10) {
		const delegateRegIndex = await redis('trx:delegate:registration', ['timestamp']);
		await delegateRegIndex.writeRange(timestamp, blockId);
	}
};

const getTransactions = async params => {
	const transactions = {
		data: [],
		meta: {},
	};

	const limit = params.limit || 10;
	const offset = params.offset || 0;

	await Promise.all(['fromTimestamp', 'toTimestamp'].map(async (timestamp) => {
		if (await validateTimestamp(params[timestamp])) {
			params[timestamp] = await getBlockchainTime(params[timestamp]);
		}
		return Promise.resolve();
	}));

	let collection = 'timestampDb';
	if (params.address) collection = `trx:address:${params.address}`;
	else if (params.senderId) collection = `trx:sender:${params.senderId}`;
	else if (params.recipientId) collection = `trx:recipient:${params.recipientId}`;
	else if (params.type === 'REGISTERDELEGATE') collection = 'trx:delegate:registration';

	const timestampDb = await redis(collection, ['timestamp']);

	if (params.fromTimestamp || params.toTimestamp
		|| (params.sort && params.sort.includes('timestamp'))) {
		params = mapParams(params, '/transactions');
		if (!params.fromTimestamp) params.fromTimestamp = 0;
		if (!params.toTimestamp) params.toTimestamp = Math.floor(Date.now() / 1000);

		let timestampSortOrder = 'desc';
		if (params.sort) [, timestampSortOrder] = params.sort.split(':');
		const blockIds = await timestampDb.findByRange('timestamp',
			params.fromTimestamp,
			params.toTimestamp,
			timestampSortOrder === 'desc',
			limit,
			offset);

		await BluebirdPromise.map(
			blockIds,
			async (blockId) => {
				const blkTransactions = await getTransactionsByBlockId(blockId);
				transactions.data = transactions.data.concat(blkTransactions.data);
				transactions.meta.count += blkTransactions.meta.count;
			},
			{ concurrency: 4 },
		);
	} else {
		const response = await coreApi.getTransactions(params);
		if (response.data) transactions.data = response.data;
		if (response.meta) transactions.meta = response.meta;
	}

	transactions.data = await BluebirdPromise.map(
		transactions.data,
		async transaction => {
			transaction.timestamp = await bIdCache.get(transaction.blockId);
			if (!transaction.timestamp) {
				const txBlock = (await coreApi.getBlocks({ height: transaction.height })).data[0];
				transaction.timestamp = txBlock.timestamp;
			}
			transaction.unixTimestamp = await getUnixTime(transaction.timestamp);
			return transaction;
		},
		{ concurrency: transactions.data.length },
	);

	if (transactions.data) transactions.data.forEach((tx) => addToIndex(tx));

	transactions.meta.total = transactions.meta.count;
	transactions.meta.count = transactions.data.length;
	transactions.meta.offset = params.offset || 0;

	return transactions;
};

signals.get('indexTransactions').add(async blockId => {
	const block = await bIdCache.get(blockId);
	if (!block) getTransactions({ blockId, limit: MAX_TX_LIMIT_PP });
});

const getPendingTransactions = async params => {
	const pendingTx = await coreApi.getPendingTransactions(params);
	return pendingTx;
};

module.exports = { getTransactions, getPendingTransactions };
