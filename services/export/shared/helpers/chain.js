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
const { MODULE, COMMAND } = require('./constants');
const { requestIndexer } = require('./request');

let networkStatus;

const getNetworkStatus = async () => {
	if (!networkStatus) {
		networkStatus = await requestIndexer('network.status');
	}
	return networkStatus;
};

const getCurrentChainID = async () => {
	const status = await getNetworkStatus();
	const { chainID } = status.data;
	return chainID;
};

const resolveReceivingChainID = (tx, currentChainID) => tx
	.moduleCommand === `${MODULE.TOKEN}:${COMMAND.TRANSFER_CROSS_CHAIN}`
	? tx.params.receivingChainID
	: currentChainID;

const getUniqueChainIDs = async (txs) => {
	const chainIDs = new Set();
	txs.forEach(tx => {
		if (tx.sendingChainID) chainIDs.add(tx.sendingChainID);
		if (tx.receivingChainID) chainIDs.add(tx.receivingChainID);
	});
	return Array.from(chainIDs);
};

module.exports = {
	getCurrentChainID,
	resolveReceivingChainID,
	getNetworkStatus,
	getUniqueChainIDs,
};
