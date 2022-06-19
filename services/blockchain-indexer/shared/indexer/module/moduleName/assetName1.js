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

// Declare and export the following asset specific constants
const assetID = 0;
const assetName = 'assetName';

// Implement the custom logic in the 'processTransaction' method and export it
// eslint-disable-next-line no-unused-vars
const processTransaction = async (blockHeader, tx, dbTrx) => {
	Promise.resolve({ blockHeader, tx });
};

module.exports = {
	assetID,
	assetName,
	processTransaction,
};
