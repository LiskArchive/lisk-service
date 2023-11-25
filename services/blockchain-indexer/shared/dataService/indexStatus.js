/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const { Signals } = require('lisk-service-framework');

const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

let indexStatsCache = {};
let isIndexingInProgress = false;
let lastUpdate = getCurrentTimestamp();

const getIndexStatus = async () => {
	const {
		currentChainHeight,
		genesisHeight,
		numBlocksIndexed,
		lastIndexedBlock = {},
		chainLength,
		percentage,
	} = indexStatsCache;

	return {
		data: {
			genesisHeight,
			lastBlockHeight: currentChainHeight,
			lastIndexedBlockHeight: lastIndexedBlock.height,
			chainLength,
			numBlocksIndexed,
			percentageIndexed: +percentage,
			isIndexingInProgress,
		},
		meta: {
			lastUpdate,
		},
	};
};

const indexStatUpdateListener = async _indexStats => {
	indexStatsCache = _indexStats;
	lastUpdate = getCurrentTimestamp();

	const indexStatus = await getIndexStatus();
	Signals.get('updateIndexStatus').dispatch(indexStatus);
};

const indexingProgressListener = numJobsInProgress => {
	isIndexingInProgress = numJobsInProgress > 0;
	lastUpdate = getCurrentTimestamp();
};

Signals.get('indexStatUpdate').add(indexStatUpdateListener);
Signals.get('numJobsInProgressUpdate').add(indexingProgressListener);

const isBlockchainFullyIndexed = () => Number(indexStatsCache.percentage) === 100;

module.exports = {
	getIndexStatus,
	isBlockchainFullyIndexed,

	// Testing
	indexStatUpdateListener,
	indexingProgressListener,
};
