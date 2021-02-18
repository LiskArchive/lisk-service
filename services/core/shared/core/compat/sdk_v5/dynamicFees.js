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
const mysqlIndex = require('../../../indexdb/mysql');
const { getApiClient } = require('../common');
const blocksIndexSchema = require('./schema/blocks');

const getBlocksIndex = () => mysqlIndex('blocks', blocksIndexSchema);

const calculateBlockSize = async block => {
	const apiClient = await getApiClient();
	const blocksDB = await getBlocksIndex();

	const [blockInfo] = await blocksDB.find({ id: block.id });
	if (blockInfo) return blockInfo.size;

	let blockSize = 0;
	if (block.numberOfTransactions === 0) return blockSize;

	const transactionSizes = block.payload.map(tx => apiClient.transaction.encode(tx).length);
	blockSize = transactionSizes.reduce((a, b) => a + b, 0);

	return blockSize;
};

const nop = () => { };

module.exports = {
	getTransactionInstanceByType: nop,
	calculateBlockSize,
};
