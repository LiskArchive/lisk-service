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
const config = require('../../config');
const { requestIndexer } = require('../utils/request');

let isGenesisBlockIndexedFlag = false;

const isGenesisBlockIndexed = async () => {
	if (isGenesisBlockIndexedFlag !== true) {
		isGenesisBlockIndexedFlag = await requestIndexer('isGenesisBlockIndexed');
	}
	return isGenesisBlockIndexedFlag;
};

const getIndexStatus = async () => requestIndexer('index.status').catch(() => null);

const getMissingBlocks = async (from, to) =>
	requestIndexer('getMissingBlocks', { from, to }).catch(err => err);

const getIndexVerifiedHeight = async () =>
	requestIndexer('getIndexVerifiedHeight').catch(() => null);

const getLiveIndexingJobCount = async () =>
	requestIndexer('getLiveIndexingJobCount').catch(
		// So that no new jobs are scheduled when indexer is failing to respond
		() => config.job.indexMissingBlocks.skipThreshold,
	);

module.exports = {
	isGenesisBlockIndexed,
	getIndexStatus,
	getMissingBlocks,
	getIndexVerifiedHeight,
	getLiveIndexingJobCount,
};
