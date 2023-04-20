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

const getMissingblocks = async (from, to) => requestIndexer('getMissingBlocks', {
	from,
	to,
});

const getCurrentHeight = async () => requestIndexer('getCurrentHeight');

const getGenesisHeight = async () => requestIndexer('getGenesisHeight');

const getIndexVerifiedHeight = async () => requestIndexer('getIndexVerifiedHeight');

const setIndexVerifiedHeight = async (height) => requestIndexer('setIndexVerifiedHeight', { height });

module.exports = {
	getMissingblocks,
	getCurrentHeight,
	getGenesisHeight,
	getIndexVerifiedHeight,
	setIndexVerifiedHeight,
};
