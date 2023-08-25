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
const { LENGTH_CHAIN_ID, LENGTH_COLLECTION_ID } = require('../constants');

const getNFTInfo = (nftID) => ({
	chainID: nftID.substring(0, LENGTH_CHAIN_ID),
	collectionID: nftID.substring(LENGTH_CHAIN_ID, LENGTH_COLLECTION_ID),
	index: Buffer.from(nftID.substring(LENGTH_CHAIN_ID + LENGTH_COLLECTION_ID)).readBigInt64BE(),
});

module.exports = {
	getNFTInfo,
};
