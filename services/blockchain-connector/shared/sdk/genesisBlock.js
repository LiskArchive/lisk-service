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
const {
	Logger,
	Exceptions: { TimeoutException },
} = require('lisk-service-framework');

const { getNodeInfo } = require('./endpoints_1');
const { getGenesisBlockFromFS } = require('./blocksUtils');

const { timeoutMessage, invokeEndpoint } = require('./client');
const { formatBlock } = require('./formatter');

const logger = Logger();

let genesisHeight;
let genesisBlockID;
let genesisConfig;

const getGenesisHeight = async () => {
	if (!genesisHeight) {
		const nodeInfo = await getNodeInfo();
		genesisHeight = nodeInfo.genesisHeight;
	}
	return genesisHeight;
};

const getGenesisBlock = async (isIncludeAssets = false) => {
	try {
		const block = await getGenesisBlockFromFS();
		// Filter out assets from genesis block and assign empty array
		return {
			...block,
			assets: isIncludeAssets ? block.assets : [],
		};
	} catch (_) {
		logger.debug('Genesis block snapshot retrieval was not possible, attempting to retrieve directly from the node.');
	}

	const height = await getGenesisHeight();
	try {
		const block = await invokeEndpoint('chain_getBlockByHeight', { height });
		return block;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getGenesisBlock\'.');
		}
		throw err;
	}
};

const getGenesisBlockID = async () => {
	if (!genesisBlockID) {
		const genesisBlock = await getGenesisBlock();
		genesisBlockID = genesisBlock.header.id;
	}
	return genesisBlockID;
};

const getGenesisConfig = async () => {
	try {
		if (!genesisConfig) {
			genesisConfig = (await getNodeInfo()).genesis;
		}
		return genesisConfig;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getGenesisConfig\'.');
		}
		throw err;
	}
};

const getGenesisAssets = async (params = {}) => {
	const rawGenesisBlock = await getGenesisBlock(true);
	const genesisBlock = await formatBlock(rawGenesisBlock);

	const assetByModule = genesisBlock.assets.find(asset => asset.module === params.module);

	if (params.subStore) {
		const assetModuleSubStoreKey = Object.keys(assetByModule.data).find(
			subStoreKey => subStoreKey === params.subStore,
		);

		if (assetModuleSubStoreKey) {
			let moduleData = assetByModule.data[assetModuleSubStoreKey];

			// Filter module data based on limit and offset
			if (typeof params.offset !== 'undefined' && params.limit) {
				moduleData = moduleData.slice(params.offset, params.offset + params.limit);
			}

			return [{
				...assetByModule,
				data: {
					[assetModuleSubStoreKey]: moduleData,
				},
			}];
		}

		// Return empty array if no data found for the input module and subStore key
		return [];
	}

	if (params.module) {
		return assetByModule ? [assetByModule] : [];
	}

	// Return all genesis block assets if no module / subStore key present in params.
	// The code may only reach here for internal calls
	return genesisBlock.assets;
};

const getGenesisAssetByModule = async (params = {}) => {
	const genesisAssets = await getGenesisAssets(params);

	if (genesisAssets && genesisAssets.length) {
		return genesisAssets[0].data;
	}
	return {};
};

/* Returns a nested object of following structure filtered by module and subStore if present
{
	moduleName1: {
		module1.data.key1 (subStore): module1.data.key1.length,
	}
	moduleName2: {
		module2.data.key2 (subStore): module2.data.key2.length,
	}
}
*/
const getGenesisAssetsLength = async (params) => {
	const genesisAssets = await getGenesisAssets(params);

	const assetLengthMap = {};

	// eslint-disable-next-line no-restricted-syntax
	for (const asset of genesisAssets) {
		Object.keys(asset.data).forEach(
			subStoreKey => {
				if (!assetLengthMap[asset.module]) assetLengthMap[asset.module] = {};
				assetLengthMap[asset.module][subStoreKey] = asset.data[subStoreKey].length;
			});
	}

	return assetLengthMap;
};

module.exports = {
	getGenesisHeight,
	getGenesisBlockID,
	getGenesisBlock,
	getGenesisConfig,
	getGenesisAssets,
	getGenesisAssetByModule,
	getGenesisAssetsLength,
};
