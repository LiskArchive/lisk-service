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
const { Logger } = require('lisk-service-framework');

const config = require('../../config');
const pouchdb = require('../pouchdb');
const { getBlocks } = require('./blocks');

const logger = Logger();

const getSelector = params => {
	const result = {};
	const selector = {};

	if (params.purge_height) selector.height = {};
	if (params.purge_height) Object.assign(selector.height, { $lte: params.purge_height });

	result.selector = selector;
	return result;
};

const purgeBlocks = async purgeLimit => {
	const db = await pouchdb(config.db.collections.blocks.name);

	const latestBlock = (await getBlocks({ limit: 1 })).data[0];
	const latestBlockHeight = latestBlock.height;

	const dbFilterParams = getSelector({ purge_height: latestBlockHeight - purgeLimit });
	const purgableBlocks = await db.find(dbFilterParams);

	const purgeResult = await db.deleteBatch(purgableBlocks);
	const purgeCount = purgeResult ? purgeResult.length : 0;

	logger.info('Purged '.concat(purgeCount)
		.concat(' blocks from db at height lower than ').concat(latestBlockHeight - purgeLimit));

	return purgeCount;
};

const purgeTransactions = async purgeLimit => {
	const db = await pouchdb(config.db.collections.transactions.name);

	const latestBlock = (await getBlocks({ limit: 1 })).data[0];
	const latestBlockHeight = latestBlock.height;

	const dbFilterParams = getSelector({ purge_height: latestBlockHeight - purgeLimit });
	const purgableTransactions = await db.find(dbFilterParams);

	const purgeResult = await db.deleteBatch(purgableTransactions);
	const purgeCount = purgeResult ? purgeResult.length : 0;

	logger.info('Purged '.concat(purgeCount)
		.concat(' transactions from db contained within blocks at height lower than ').concat(latestBlockHeight - purgeLimit));

	return purgeCount;
};

module.exports = {
	purgeBlocks,
	purgeTransactions,
};
