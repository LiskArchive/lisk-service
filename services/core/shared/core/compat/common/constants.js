/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const { CacheRedis, Utils } = require('lisk-service-framework');

const http = require('./httpRequest');
const { getApiClient } = require('./wsRequest');

const ObjectUtilService = Utils.Data;
const { isProperObject } = ObjectUtilService;

const config = require('../../../../config');

const constantsCache = CacheRedis('networkConstants', config.endpoints.redis);

let coreVersion = '3.0.0-beta.2';
let constants;
let readyStatus;
let registeredLiskModuleAssets;
let isSyncFullBlockchain = false;
let isIndexReady = false;

const networkFeeConstants = {
	minFeePerByte: undefined,
	baseFeeByModuleAssetId: {},
	baseFeeByModuleAssetName: {},
};

const setRegisteredmoduleAssets = moduleAssets => registeredLiskModuleAssets = moduleAssets;

const resolvemoduleAssets = (data) => {
	let result = [];
	data.forEach(liskModule => {
		if (liskModule.transactionAssets.length) {
			result = result.concat(
				liskModule.transactionAssets.map(asset => {
					const id = String(liskModule.id).concat(':').concat(asset.id);
					if (liskModule.name && asset.name) {
						const name = liskModule.name.concat(':').concat(asset.name);
						return { id, name };
					}
					return { id };
				}),
			);
		}
	});
	return result;
};

const resolveBaseFees = (networkConstants) => {
	networkConstants.data.genesisConfig.baseFees.forEach(entry => {
		const moduleAssetId = String(entry.moduleID).concat(':').concat(entry.assetID);
		networkFeeConstants.baseFeeByModuleAssetId[moduleAssetId] = entry.baseFee;

		const [moduleAsset] = networkConstants.data.moduleAssets.filter(o => o.id === moduleAssetId);
		networkFeeConstants.baseFeeByModuleAssetName[moduleAsset.name] = entry.baseFee;
	});
	networkFeeConstants.minFeePerByte = networkConstants.data.genesisConfig.minFeePerByte;

	return networkFeeConstants;
};

const getNetworkConstants = async () => {
	try {
		if (!constants) {
			let result = await http.get('/node/constants'); // Necessary to remove cyclic dependency
			if (Object.getOwnPropertyNames(result).length === 0) {
				const apiClient = await getApiClient();
				const info = await apiClient.node.getNodeInfo();
				info.moduleAssets = resolvemoduleAssets(info.registeredModules);
				result = { data: info };

				resolveBaseFees(result);
			}
			if (!isProperObject(result)) return {};
			constants = result;
			await constantsCache.set('networkConstants', JSON.stringify(constants));
		}
		return constants;
	} catch (_) {
		return {
			data: { error: 'Core service could not be started' },
		};
	}
};

const setCoreVersion = version => coreVersion = version;

const getCoreVersion = () => coreVersion;

const setReadyStatus = status => readyStatus = status;

const getReadyStatus = () => readyStatus;

const getRegisteredModuleAssets = () => registeredLiskModuleAssets;

const getNetworkFeeConstants = () => networkFeeConstants;

const setIsSyncFullBlockchain = isSync => isSyncFullBlockchain = isSync;

const getIsSyncFullBlockchain = () => isSyncFullBlockchain;
const setIndexReadyStatus = isReady => isIndexReady = isReady;

const getIndexReadyStatus = () => isIndexReady;

module.exports = {
	getNetworkConstants,
	setCoreVersion,
	getCoreVersion,
	setReadyStatus,
	getReadyStatus,
	getRegisteredModuleAssets,
	setRegisteredmoduleAssets,
	resolvemoduleAssets,
	getNetworkFeeConstants,
	setIsSyncFullBlockchain,
	getIsSyncFullBlockchain,
	setIndexReadyStatus,
	getIndexReadyStatus,
};
