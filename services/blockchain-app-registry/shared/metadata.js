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

const config = require('../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const { read } = require('./utils/fsUtils');

const applicationsIndexSchema = require('./database/schema/applications');
const tokensIndexSchema = require('./database/schema/tokens');

const LSK_LOCAL_CHAIN_ID = '00000000';

const getApplicationsIndex = () => getTableInstance(
	applicationsIndexSchema.tableName,
	applicationsIndexSchema,
	MYSQL_ENDPOINT,
);

const getTokensIndex = () => getTableInstance(
	tokensIndexSchema.tableName,
	tokensIndexSchema,
	MYSQL_ENDPOINT,
);

const getBlockchainAppsMetaList = async (params) => {
	const applicationsDB = await getApplicationsIndex();

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
	const defaultApps = await applicationsDB.find(
		{ ...params, limit, isDefault: true },
		['network', 'chainID', 'chainName'],
	);

	if (defaultApps.length < params.limit) {
		const nonDefaultApps = await applicationsDB.find(
			{ ...params, limit, isDefault: false },
			['network', 'chainID', 'chainName'],
		);

		blockchainAppsMetaList.data = defaultApps.concat(nonDefaultApps);
	}

	blockchainAppsMetaList.data = blockchainAppsMetaList.data
		.slice(params.offset, params.offset + params.limit);

	// TODO: Use count method directly once support for custom column-based count added https://github.com/LiskHQ/lisk-service/issues/1188
	const [{ total }] = await applicationsDB.rawQuery('SELECT COUNT(chainName) as total from applications');

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
	const applicationsDB = await getApplicationsIndex();

	const blockchainAppsMetadata = {
		data: [],
		meta: {},
	};

	if (params.network) {
		const { network, ...remParams } = params;
		params = remParams;
		params.whereIn = {
			property: 'network',
			values: network.split(','),
		};
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
	const defaultApps = await applicationsDB.find(
		{ ...params, limit, isDefault: true },
		['network', 'appDirName'],
	);

	if (defaultApps.length < params.limit) {
		const nonDefaultApps = await applicationsDB.find(
			{ ...params, limit, isDefault: false },
			['network', 'appDirName'],
		);

		blockchainAppsMetadata.data = defaultApps.concat(nonDefaultApps);
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
	const [{ total }] = await applicationsDB.rawQuery('SELECT COUNT(chainName) as total from applications');

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
	const applicationsDB = await getApplicationsIndex();
	const tokensDB = await getTokensIndex();

	const blockchainAppsTokenMetadata = {
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

	if (params.tokenID) {
		const { tokenID, ...remParams } = params;
		params = remParams;

		const chainID = tokenID.substring(0, 8);
		const localID = tokenID.substring(8);
		const isGlobalTokenID = chainID !== LSK_LOCAL_CHAIN_ID;

		// chainID should match global tokenID if passed
		if (isGlobalTokenID && params.chainID && chainID !== params.chainID) {
			throw new InvalidParamsException('Invalid global tokenID and chainID combination');
		}

		// chainID must match local tokenID
		if (!isGlobalTokenID) {
			if (!params.chainID) throw new InvalidParamsException('chainID is required for local tokenID');

			if (chainID !== params.chainID) throw new InvalidParamsException('Invalid local tokenID and chainID combination');
		}

		params.chainID = chainID;
		params.localID = localID;
	} else if (params.chainID && params.chainID === LSK_LOCAL_CHAIN_ID) {
		// Request is invalid if tokenID not present for local chainID
		throw new InvalidParamsException('tokenID is required for local chainID');
	}

	const tokensResultSet = await tokensDB.find(params, ['network', 'chainID', 'chainName']);

	const uniqueChainMap = {};
	tokensResultSet.forEach(item => uniqueChainMap[item.chainID] = item);
	const uniqueChainList = Object.values(uniqueChainMap);

	await BluebirdPromise.map(
		uniqueChainList,
		async (tokenMeta) => {
			const [{ appDirName }] = await applicationsDB.find(
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
	const [{ total }] = await tokensDB.rawQuery('SELECT COUNT(tokenName) as total from token_metadata');

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
