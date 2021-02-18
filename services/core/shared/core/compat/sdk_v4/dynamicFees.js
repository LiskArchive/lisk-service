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
const { CacheRedis } = require('lisk-service-framework');

const {
	TransferTransaction,
	DelegateTransaction,
	MultisignatureTransaction,
	VoteTransaction,
	UnlockTransaction,
	ProofOfMisbehaviorTransaction,
} = require('@liskhq/lisk-transactions-v4');

const config = require('../../../../config');

const cacheRedisBlockSizes = CacheRedis('blockSizes', config.endpoints.redis);

const getTransactionInstanceByType = transaction => {
	const transactionMap = {
		8: TransferTransaction,
		10: DelegateTransaction,
		12: MultisignatureTransaction,
		13: VoteTransaction,
		14: UnlockTransaction,
		15: ProofOfMisbehaviorTransaction,
	};

	const TransactionClass = transactionMap[transaction.type];
	const tx = new TransactionClass(transaction);
	return tx;
};

const calculateBlockSize = async block => {
	const cachedBlockSize = await cacheRedisBlockSizes.get(block.id);
	if (cachedBlockSize) return cachedBlockSize;

	let blockSize = 0;
	if (block.numberOfTransactions === 0) return blockSize;

	const transactionSizes = block.payload.map(transaction => {
		const tx = getTransactionInstanceByType(transaction);
		const transactionSize = tx.getBytes().length;
		return transactionSize;
	});

	blockSize = transactionSizes.reduce((a, b) => a + b, 0);
	await cacheRedisBlockSizes.set(block.id, blockSize, 300); // Cache for 5 mins

	return blockSize;
};

module.exports = {
	getTransactionInstanceByType,
	calculateBlockSize,
};
