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
const Redis = require('ioredis');

const {
	Logger,
	Queue,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const logger = Logger();

const config = require('../../config');

const redis = new Redis(config.endpoints.cache);

const accountsTableSchema = require('../database/schema/accounts');
const { getLisk32AddressFromPublicKey } = require('../utils/account');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getAccountsTable = () => getTableInstance(accountsTableSchema, MYSQL_ENDPOINT);

const updateAccountInfoPk = async (job) => {
	const publicKey = job.data;

	try {
		const account = {
			address: getLisk32AddressFromPublicKey(publicKey),
			publicKey,
		};

		const accountsTable = await getAccountsTable();
		await accountsTable.upsert(account);
	} catch (err) {
		logger.warn('Failed to update accounts table. Will retry later.');
		await redis.sadd(config.queue.indexAccountPublicKey.name, publicKey);
	}
};

const updateAccountInfoAddr = async (job) => {
	const address = job.data;

	try {
		const account = {
			address,
		};

		const accountsTable = await getAccountsTable();
		await accountsTable.upsert(account);
	} catch (err) {
		logger.warn('Failed to update accounts table. Will retry later.');
		await redis.sadd(config.queue.indexAccountAddress.name, address);
	}
};

// Initialize queues
const accountPkUpdateQueue = Queue(
	config.endpoints.cache,
	config.queue.accountQueueByPublicKey.name,
	updateAccountInfoPk,
	config.queue.accountQueueByPublicKey.concurrency,
);
const accountAddrUpdateQueue = Queue(
	config.endpoints.cache,
	config.queue.accountQueueByAddress.name,
	updateAccountInfoAddr,
	config.queue.accountQueueByAddress.concurrency,
);
const indexAccountPublicKey = async (publicKey) => redis.sadd(
	config.queue.indexAccountPublicKey.name,
	publicKey,
);

const indexAccountAddress = async (address) => redis.sadd(
	config.queue.indexAccountAddress.name,
	address,
);

const triggerAccountUpdates = async () => {
	const publicKeys = await redis.spop(
		config.queue.indexAccountPublicKey.name,
		config.queue.indexAccountPublicKey.concurrency,
	);

	publicKeys.forEach(publicKey => {
		if (typeof publicKey === 'string') accountPkUpdateQueue.add(publicKey);
	});

	const addresses = await redis.spop(
		config.queue.indexAccountAddress.name,
		config.queue.indexAccountAddress.concurrency,
	);
	addresses.forEach(address => {
		if (typeof address === 'string') accountAddrUpdateQueue.add(address);
	});
};

module.exports = {
	indexAccountPublicKey,
	indexAccountAddress,
	triggerAccountUpdates,

	// Testing
	updateAccountInfoPk,
	updateAccountInfoAddr,
};
