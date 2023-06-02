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
const BluebirdPromise = require('bluebird');

const {
	HTTP,
	MySQL: { getTableInstance },
	Logger,
} = require('lisk-service-framework');

const logger = Logger();

const { LENGTH_CHAIN_ID } = require('./constants');
const { isMainchain } = require('./chain');
const { read } = require('./utils/fs');
const { requestIndexer } = require('./utils/request');

const config = require('../config');
const appMetadataTableSchema = require('./database/schema/application_metadata');
const tokenMetadataTableSchema = require('./database/schema/token_metadata');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const APP_STATUS = {
	DEFAULT: 'unregistered',
	ACTIVE: 'active',
};

const knownMainchainIDs = Object
	.keys(config.CHAIN_ID_PREFIX_NETWORK_MAP)
	.map(e => e.padEnd(LENGTH_CHAIN_ID, '0'));

const getApplicationMetadataTable = () => getTableInstance(appMetadataTableSchema, MYSQL_ENDPOINT);
const getTokenMetadataTable = () => getTableInstance(tokenMetadataTableSchema, MYSQL_ENDPOINT);

const getBlockchainAppsMetaList = async (params) => {
	const applicationMetadataTable = await getApplicationMetadataTable();

	const blockchainAppsMetaList = {
		data: [],
		meta: {},
	};

	if (params.search) {
		const { search, ...remParams } = params;
		params = remParams;

		params.search = {
			property: 'chainName',
			pattern: search,
		};
	}

	if (params.network) {
		const { network, ...remParams } = params;
		params = remParams;
		params.whereIn = [{
			property: 'network',
			values: network.split(','),
		}];
	}

	const limit = params.limit * config.supportedNetworks.length;
	const defaultApps = await applicationMetadataTable.find(
		{ ...params, limit, isDefault: true },
		['network', 'chainID', 'chainName'],
	);

	if (defaultApps.length < params.limit) {
		const nonDefaultApps = await applicationMetadataTable.find(
			{ ...params, limit, isDefault: false },
			['network', 'chainID', 'chainName'],
		);

		blockchainAppsMetaList.data = defaultApps.concat(nonDefaultApps);
	}

	blockchainAppsMetaList.data = blockchainAppsMetaList.data
		.slice(params.offset, params.offset + params.limit);

	const total = await applicationMetadataTable.count(params);

	blockchainAppsMetaList.meta = {
		count: blockchainAppsMetaList.data.length,
		offset: params.offset,
		total,
	};

	return blockchainAppsMetaList;
};

const readMetadataFromClonedRepo = async (network, appDirName, filename) => {
	const {
		dataDir,
		gitHub: { appRegistryRepoName },
	} = config;

	const filepath = `${dataDir}/${appRegistryRepoName}/${network}/${appDirName}/${filename}`;
	const metadataStr = await read(filepath);
	const parsedMetadata = JSON.parse(metadataStr);

	return parsedMetadata;
};

const getBlockchainAppsMetadata = async (params) => {
	const applicationMetadataTable = await getApplicationMetadataTable();

	const blockchainAppsMetadata = {
		data: [],
		meta: {},
	};

	// Initialize DB variables
	params.whereIn = [];

	if (params.chainID) {
		const { chainID, ...remParams } = params;
		params = remParams;
		const chainIDs = chainID.split(',');

		params.whereIn.push({
			property: 'chainID',
			values: chainIDs,
		});

		if (!('network' in params)) {
			const networkSet = new Set();
			chainIDs.forEach(_chainID => {
				const network = config.CHAIN_ID_PREFIX_NETWORK_MAP[_chainID.substring(0, 2)];
				networkSet.add(network);
			});
			params.network = Array.from(networkSet).join(',');
		}
	}

	if (params.network) {
		const { network, ...remParams } = params;
		params = remParams;
		params.whereIn.push({
			property: 'network',
			values: network.split(','),
		});
	}

	if (params.search) {
		const { search, ...remParams } = params;
		params = remParams;
		params.search = {
			property: 'chainName',
			pattern: search,
		};
	}

	const limit = params.limit * config.supportedNetworks.length;
	if (params.isDefault !== false) {
		const defaultApps = await applicationMetadataTable.find(
			{ ...params, limit, isDefault: true },
			['network', 'appDirName', 'isDefault'],
		);
		blockchainAppsMetadata.data = defaultApps;
	}

	if (params.isDefault !== true && blockchainAppsMetadata.data.length < params.limit) {
		let offset = { params };

		// If params.isDefault is not passed in the request then adjust the offset
		if (!('isDefault' in params)) {
			const totalDefaultApps = await applicationMetadataTable.count(
				{ ...params, limit, isDefault: true },
			);
			offset = (params.offset - totalDefaultApps) > 0 ? params.offset - totalDefaultApps : 0;
		}

		const nonDefaultApps = await applicationMetadataTable.find(
			{ ...params, offset, limit, isDefault: false },
			['network', 'appDirName', 'isDefault'],
		);

		blockchainAppsMetadata.data.push(...nonDefaultApps);
	}

	blockchainAppsMetadata.data = await BluebirdPromise.map(
		// Slice necessary to adhere to limit passed
		blockchainAppsMetadata.data.slice(0, params.limit),
		async (appMetadata) => {
			const appMeta = await readMetadataFromClonedRepo(
				appMetadata.network,
				appMetadata.appDirName,
				config.FILENAME.APP_JSON,
			);
			appMeta.isDefault = appMetadata.isDefault;

			if (await isMainchain()
				&& knownMainchainIDs.includes(appMeta.chainID)) {
				appMeta.status = APP_STATUS.ACTIVE;
			} else {
				const [blockchainApp] = (await requestIndexer('blockchain.apps', { chainID: appMeta.chainID })).data;
				appMeta.status = blockchainApp ? blockchainApp.status : APP_STATUS.DEFAULT;
			}

			return appMeta;
		},
		{ concurrency: blockchainAppsMetadata.data.length },
	);

	const total = await applicationMetadataTable.count(params);

	blockchainAppsMetadata.meta = {
		count: blockchainAppsMetadata.data.length,
		offset: params.offset,
		total,
	};

	return blockchainAppsMetadata;
};

const getBlockchainAppsTokenMetadata = async (params) => {
	const applicationMetadataTable = await getApplicationMetadataTable();
	const tokenMetadataTable = await getTokenMetadataTable();

	const blockchainAppsTokenMetadata = {
		data: [],
		meta: {},
	};

	// Initialize DB params
	params.whereIn = [];

	if (params.search) {
		const { search, ...remParams } = params;
		params = remParams;
		params.search = {
			property: 'chainName',
			pattern: search,
		};
	}

	if (params.tokenName) {
		const { tokenName, ...remParams } = params;
		params = remParams;

		params.whereIn.push({
			property: 'tokenName',
			values: tokenName.split(','),
		});
	}

	if (params.tokenID) {
		const { tokenID, ...remParams } = params;
		params = remParams;

		params.whereIn.push({
			property: 'tokenID',
			values: tokenID.split(','),
		});
	}

	if (params.chainID) {
		const { chainID, ...remParams } = params;
		params = remParams;
		params.search = {
			property: 'tokenID',
			startsWith: chainID,
		};
	}

	if (params.network) {
		const { network, ...remParams } = params;
		params = remParams;

		params.whereIn.push({
			property: 'network',
			values: network.split(','),
		});
	}

	const tokensResultSet = await tokenMetadataTable.find(params, ['network', 'tokenID', 'chainName']);

	// Used to avoid reading same token metadata json file multiple times
	const uniqueChainMap = {};
	// Used to only return the filtered token details in response
	const resultTokenIDSet = new Set();
	tokensResultSet.forEach(tokenMeta => {
		const chainID = tokenMeta.tokenID.substring(0, LENGTH_CHAIN_ID);
		uniqueChainMap[chainID] = tokenMeta;
		resultTokenIDSet.add(tokenMeta.tokenID);
	});
	const uniqueChainList = Object.values(uniqueChainMap);

	await BluebirdPromise.map(
		uniqueChainList,
		async (tokenMeta) => {
			const chainID = tokenMeta.tokenID.substring(0, LENGTH_CHAIN_ID);
			const [{ appDirName }] = await applicationMetadataTable.find(
				{ network: tokenMeta.network, chainID },
				['appDirName'],
			);

			const parsedTokenMeta = await readMetadataFromClonedRepo(
				tokenMeta.network,
				appDirName,
				config.FILENAME.NATIVETOKENS_JSON,
			);
			parsedTokenMeta.tokens.forEach(token => {
				if (resultTokenIDSet.has(token.tokenID)) {
					blockchainAppsTokenMetadata.data.push({
						...token,
						chainID,
						chainName: tokenMeta.chainName,
						network: tokenMeta.network,
					});
				}
			});
		},
		{ concurrency: uniqueChainList.length },
	);

	const total = await tokenMetadataTable.count(params);

	blockchainAppsTokenMetadata.meta = {
		count: blockchainAppsTokenMetadata.data.length,
		offset: params.offset,
		total,
	};

	return blockchainAppsTokenMetadata;
};

const resolveTokenMetaInfo = async (tokenInfoFromDB) => {
	const tokensMeta = [];
	const processedChainIDs = new Set();
	const resultTokenIDsSet = tokenInfoFromDB.reduce(
		(accSet, tokenInfo) => accSet.add(tokenInfo.tokenID),
		new Set(),
	);

	await BluebirdPromise.map(
		tokenInfoFromDB,
		async (entry) => {
			const chainID = entry.tokenID.substring(0, LENGTH_CHAIN_ID);

			// Avoid reading same token metadata file multiple times
			if (processedChainIDs.has(chainID)) return;
			processedChainIDs.add(chainID);

			const parsedTokenMeta = await readMetadataFromClonedRepo(
				entry.network,
				entry.chainName,
				config.FILENAME.NATIVETOKENS_JSON,
			);

			// Loop over all tokens in the token metadata file
			parsedTokenMeta.tokens.forEach(async token => {
				// Only add filtered tokens info to the response
				if (resultTokenIDsSet.has(token.tokenID)) {
					tokensMeta.push({
						...token,
						chainID,
						chainName: entry.chainName,
						network: entry.network,
					});
				}
			});
		},
		{ concurrency: tokenInfoFromDB.length },
	);

	return tokensMeta;
};

const getSupportedTokensFromServiceURLs = async (serviceURLs) => {
	for (let i = 0; i < serviceURLs.length; i++) {
		const tokenSummaryEndpoint = `${serviceURLs[i].http}/api/v3/token/summary`;
		try {
			// eslint-disable-next-line no-await-in-loop
			const { data: response } = await HTTP.request(tokenSummaryEndpoint);

			if (response.data && response.data.supportedTokens) {
				return Promise.resolve(response.data.supportedTokens);
			}
		} catch (err) {
			logger.warn(err);

			// eslint-disable-next-line no-continue
			continue;
		}
	}
	return Promise.reject(new Error('Supported tokens not found from service URLs'));
};

const getAllTokensMetaInNetworkByChainID = async (chainID, limit, offset, sort) => {
	const tokenMetadataTable = await getTokenMetadataTable();
	const searchParams = {
		search: {
			property: 'tokenID',
			startsWith: chainID.substring(0, 2),
		},
		limit,
		offset,
		sort,
	};
	const tokensResultSet = await tokenMetadataTable.find(searchParams, ['network', 'tokenID', 'chainName']);
	const total = await tokenMetadataTable.count(searchParams);
	const tokensMeta = await resolveTokenMetaInfo(tokensResultSet);
	// Fetch the data
	return { tokensMeta, total };
};

const getTokensMetaByTokenIDs = async (patternTokenIDs, exactTokenIDs, limit, offset, sort) => {
	const tokenMetadataTable = await getTokenMetadataTable();
	const searchParams = {
		whereIn: [{
			property: 'tokenID',
			values: exactTokenIDs,
		}],
		orSearch: patternTokenIDs.map(e => {
			const chainID = e.substring(0, LENGTH_CHAIN_ID);
			return {
				property: 'tokenID',
				startsWith: chainID,
			};
		}),
		limit,
		offset,
		sort,
	};

	const tokensResultSet = await tokenMetadataTable.find(searchParams, ['network', 'tokenID', 'chainName']);
	const total = await tokenMetadataTable.count(searchParams);

	// Fetch the data
	const tokensMeta = await resolveTokenMetaInfo(tokensResultSet);
	return { tokensMeta, total };
};

const getBlockchainAppsTokensSupportedMetadata = async (params) => {
	const { chainID, limit, offset, sort } = params;
	const applicationMetadataTable = await getApplicationMetadataTable();

	const tokenMetadata = {
		data: [],
		meta: {},
	};

	// Check if the metadata for the requested chainID exists
	const [requestedAppInfo] = await applicationMetadataTable.find({ chainID, limit: 1 }, ['network', 'chainName']);
	if (!requestedAppInfo) return tokenMetadata;

	const { serviceURLs } = await readMetadataFromClonedRepo(
		requestedAppInfo.network,
		requestedAppInfo.chainName,
		config.FILENAME.APP_JSON,
	);

	try {
		// Query supported tokens information for the requested chainID
		const supportedTokensInfo = await getSupportedTokensFromServiceURLs(serviceURLs);
		const { isSupportAllTokens, exactTokenIDs, patternTokenIDs } = supportedTokensInfo;

		const { tokensMeta, total } = isSupportAllTokens
			? await getAllTokensMetaInNetworkByChainID(chainID, limit, offset, sort)
			: await getTokensMetaByTokenIDs(patternTokenIDs, exactTokenIDs, limit, offset, sort);

		tokenMetadata.data = tokensMeta;
		tokenMetadata.meta = {
			count: tokensMeta.length,
			offset,
			total,
		};

		return tokenMetadata;
	} catch (err) {
		logger.error(err);
		return tokenMetadata;
	}
};

module.exports = {
	getBlockchainAppsMetaList,
	getBlockchainAppsMetadata,
	getBlockchainAppsTokenMetadata,
	getBlockchainAppsTokensSupportedMetadata,
};
