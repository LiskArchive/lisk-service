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
const blockchainStore = require('./indexer/blockchainStore');
const { requestRpc } = require('./utils/appContext');

const setFinalizedHeight = (height) => blockchainStore.set('finalizedHeight', height);
const getFinalizedHeight = () => blockchainStore.get('finalizedHeight');

const setGenesisHeight = (height) => blockchainStore.set('genesisHeight', height);
const getGenesisHeight = () => blockchainStore.get('genesisHeight');

let genesisConfig;

const updateFinalizedHeight = async () => {
	const finalizedHeight = await requestRpc('getNodeInfo').finalizedHeight; // TODO: Replace when network constants implemented in connector
	await setFinalizedHeight(finalizedHeight);
};

const getCurrentHeight = async () => {
	const currentHeight = (await await requestRpc('getNodeInfo')).height; // TODO: Replace when network constants implemented in connector
	return currentHeight;
};

const getGenesisConfig = async () => {
	if (!genesisConfig) {
		const networkStatus = await requestRpc('getNodeInfo'); // TODO: Replace when network constants implemented in connector
		genesisConfig = networkStatus.genesisConfig;
	}
	return genesisConfig;
};

const updateGenesisHeight = async () => {
	// Get genesis height
	const data = await requestRpc('getNodeInfo'); // TODO: Replace when network constants implemented in connector
	await setGenesisHeight(data.genesisHeight);
};

module.exports = {
	updateFinalizedHeight,
	getFinalizedHeight,
	getCurrentHeight,
	getGenesisConfig,
	getGenesisHeight,
	updateGenesisHeight,
};
