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
const blockchainStore = require('./blockchainStore');
const { getAppContext } = require('../utils/appContext');

const setFinalizedHeight = (height) => blockchainStore.set('finalizedHeight', height);
const getFinalizedHeight = () => blockchainStore.get('finalizedHeight');

const setGenesisHeight = (height) => blockchainStore.set('genesisHeight', height);
const getGenesisHeight = () => blockchainStore.get('genesisHeight');

let genesisConfig;

const updateFinalizedHeight = async () => {
	const app = await getAppContext();
	// Get genesis height
	const { data: { finalizedHeight } } = await app
		.requestRpc('connector.getNodeInfo', {}); // TODO: Replace when network constants implemented in connector
	await setFinalizedHeight(finalizedHeight);
};

const getCurrentHeight = async () => {
	const app = await getAppContext();
	const currentHeight = (await app.requestRpc('connector.getNodeInfo', {})).height;
	return currentHeight;
};

const getGenesisConfig = async () => {
	const app = await getAppContext();
	if (!genesisConfig) {
		const networkStatus = await app.requestRpc('connector.getNodeInfo', {});
		genesisConfig = networkStatus.genesisConfig; // TODO: Replace when network constants implemented in connector
	}
	return genesisConfig;
};

const updateGenesisHeight = async () => {
	const app = await getAppContext();
	// Get genesis height
	const data = await app.requestRpc('connector.getNodeInfo', {}); // TODO: Replace when network constants implemented in connector
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
