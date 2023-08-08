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
const { requestIndexer } = require('../utils/request');

let isGenesisBlockIndexedFlag = false;

const getCurrentHeight = async () => requestIndexer('getCurrentHeight');

const getGenesisHeight = async () => requestIndexer('getGenesisHeight');

const getMissingBlocks = async (from, to) => requestIndexer(
	'getMissingBlocks', { from, to },
);

const getIndexVerifiedHeight = async () => requestIndexer('getIndexVerifiedHeight');

const setIndexVerifiedHeight = async (height) => requestIndexer('setIndexVerifiedHeight', { height });

const isGenesisBlockIndexed = async () => {
	if (isGenesisBlockIndexedFlag !== true) {
		isGenesisBlockIndexedFlag = await requestIndexer('isGenesisBlockIndexed');
	}
	return isGenesisBlockIndexedFlag;
};

const getLiveIndexingJobCount = async () => requestIndexer('getLiveIndexingJobCount');

module.exports = {
	getMissingBlocks,
	getCurrentHeight,
	getGenesisHeight,
	getIndexVerifiedHeight,
	setIndexVerifiedHeight,
	isGenesisBlockIndexed,
	getLiveIndexingJobCount,
};
