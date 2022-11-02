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
	Exceptions: { InvalidParamsException },
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const {
	LENGTH_CHAIN_ID,
} = require('./constants');
const { read } = require('./utils/fsUtils');

const config = require('../config');
const applicationMetadataIndexSchema = require('./database/schema/application_metadata');
const tokenMetadataIndexSchema = require('./database/schema/token_metadata');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getApplicationMetadataIndex = () => getTableInstance(
	applicationMetadataIndexSchema.tableName,
	applicationMetadataIndexSchema,
	MYSQL_ENDPOINT,
);

const getTokenMetadataIndex = () => getTableInstance(
	tokenMetadataIndexSchema.tableName,
	tokenMetadataIndexSchema,
	MYSQL_ENDPOINT,
);

const getBlockchainAppsMetaList = async (params) => {
	const applicationMetadataTable = await getApplicationMetadataIndex();

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

	// TODO: Use count method directly once support for custom column-based count added https://github.com/LiskHQ/lisk-service/issues/1188
	const [{ total }] = await applicationMetadataTable.rawQuery(`SELECT COUNT(chainName) as total from ${applicationMetadataIndexSchema.tableName}`);

	blockchainAppsMetaList.meta = {
		count: blockchainAppsMetaList.data.length,
		offset: params.offset,
		total,
	};

	return blockchainAppsMetaList;
};

const getBlockchainAppsMetadata = async (params) => {
	const { dataDir } = config;
	const repo = config.gitHub.appRegistryRepoName;
	const applicationMetadataTable = await getApplicationMetadataIndex();

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
	const defaultApps = await applicationMetadataTable.find(
		{ ...params, limit, isDefault: true },
		['network', 'appDirName'],
	);
	blockchainAppsMetadata.data = defaultApps;

	if (defaultApps.length < params.limit) {
		const nonDefaultApps = await applicationMetadataTable.find(
			{ ...params, limit, isDefault: false },
			['network', 'appDirName'],
		);

		blockchainAppsMetadata.data.push(...nonDefaultApps);
	}

	blockchainAppsMetadata.data = await BluebirdPromise.map(
		blockchainAppsMetadata.data,
		async (appMetadata) => {
			const appPathInClonedRepo = `${dataDir}/${repo}/${appMetadata.network}/${appMetadata.appDirName}`;
			const chainMetaString = await read(`${appPathInClonedRepo}/${config.FILENAME.APP_JSON}`);
			const chainMeta = JSON.parse(chainMetaString);
			return chainMeta;
		},
		{ concurrency: blockchainAppsMetadata.data.length },
	);

	// TODO: Use count method directly once support for custom column-based count added https://github.com/LiskHQ/lisk-service/issues/1188
	const [{ total }] = await applicationMetadataTable.rawQuery(`SELECT COUNT(chainName) as total from ${applicationMetadataIndexSchema.tableName}`);

	blockchainAppsMetadata.meta = {
		count: blockchainAppsMetadata.data.length,
		offset: params.offset,
		total,
	};

	return blockchainAppsMetadata;
};

const getBlockchainAppsTokenMetadata = async (params) => {
	const { dataDir } = config;
	const repo = config.gitHub.appRegistryRepoName;
	const applicationMetadataTable = await getApplicationMetadataIndex();
	const tokenMetadataTable = await getTokenMetadataIndex();

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

		// chainID or chainName must be specified with the network
		// Skip when tokenID is specified, network can be resolved automatically
		if (!('tokenID' in params) && !('chainID' in params) && ((!('chainName' in params)) || (!('network' in params)))) {
			throw new InvalidParamsException('\'tokenName\' must be specified with either \'chainID\', or \'chainName\' and \'network\'.');
		}
		params.whereIn.push({
			property: 'tokenName',
			values: tokenName.split(','),
		});
	}

	if (params.tokenID) {
		const { tokenID, ...remParams } = params;
		params = remParams;
		const networkSet = new Set();

		const chainIDlocalIDPairs = tokenID.split(',').map(_tokenID => {
			const chainID = _tokenID.substring(0, LENGTH_CHAIN_ID).toLowerCase();
			const localID = _tokenID.substring(LENGTH_CHAIN_ID).toLowerCase();

			if (typeof params.network === 'undefined') {
				const network = config.CHAIN_ID_PREFIX_NETWORK_MAP[chainID.substring(0, 2)];
				networkSet.push(network);
			}

			return [chainID, localID];
		});

		params.whereIn.push({
			property: ['chainID', 'localID'],
			values: chainIDlocalIDPairs,
		});

		// Resolve network if not passed yet
		if (!('network' in params)) {
			params.network = Array.from(networkSet).join(',');
		}
	}

	// Resolve network from chainID if present
	if (params.chainID && !('network' in params)) {
		params.network = config.CHAIN_ID_PREFIX_NETWORK_MAP[params.chainID.substring(0, 2)];
	}

	if (params.network) {
		const { network, ...remParams } = params;
		params = remParams;

		params.whereIn.push({
			property: 'network',
			values: network.split(','),
		});
	}

	const tokensResultSet = await tokenMetadataTable.find(params, ['network', 'chainID', 'chainName']);

	const uniqueChainMap = {};
	tokensResultSet.forEach(item => uniqueChainMap[item.chainID] = item);
	const uniqueChainList = Object.values(uniqueChainMap);

	await BluebirdPromise.map(
		uniqueChainList,
		async (tokenMeta) => {
			const [{ appDirName }] = await applicationMetadataTable.find(
				{ network: tokenMeta.network, chainID: tokenMeta.chainID },
				['appDirName'],
			);
			const appPathInClonedRepo = `${dataDir}/${repo}/${tokenMeta.network}/${appDirName}`;
			const tokenMetaString = await read(`${appPathInClonedRepo}/${config.FILENAME.NATIVETOKENS_JSON}`);
			const parsedTokenMeta = JSON.parse(tokenMetaString);

			parsedTokenMeta.tokens.forEach(token => {
				blockchainAppsTokenMetadata.data.push({
					...token,
					chainID: tokenMeta.chainID,
					chainName: tokenMeta.chainName,
					network: tokenMeta.network,
				});
			});
		},
		{ concurrency: uniqueChainList.length },
	);

	// TODO: Use count method directly once support for custom column-based count added https://github.com/LiskHQ/lisk-service/issues/1188
	const [{ total }] = await tokenMetadataTable.rawQuery(`SELECT COUNT(tokenName) as total from ${tokenMetadataIndexSchema.tableName}`);

	blockchainAppsTokenMetadata.meta = {
		count: blockchainAppsTokenMetadata.data.length,
		offset: params.offset,
		total,
	};

	return blockchainAppsTokenMetadata;
};

module.exports = {
	getBlockchainAppsMetaList,
	getBlockchainAppsMetadata,
	getBlockchainAppsTokenMetadata,
};
