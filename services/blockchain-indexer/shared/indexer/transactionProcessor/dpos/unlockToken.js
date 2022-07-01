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
// Command specific constants
const commandID = 2;
const commandName = 'unlockToken';

// eslint-disable-next-line no-unused-vars
const processTransaction = async (blockHeader, tx, dbTrx) => {
};

module.exports = {
	commandID,
	commandName,
	processTransaction,
};
