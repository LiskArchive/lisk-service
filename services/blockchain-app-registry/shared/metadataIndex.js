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
const path = require('path');

const {
	Logger,
	MySQL: {
		getTableInstance,
		getDbConnection,
		startDbTransaction,
		commitDbTransaction,
		rollbackDbTransaction,
	},
} = require('lisk-service-framework');

const applicationMetadataIndexSchema = require('./database/schema/application_metadata');
const tokenMetadataIndexSchema = require('./database/schema/token_metadata');

const { getDirectories, read, getFiles, exists } = require('./utils/fsUtils');

const config = require('../config');
const constants = require('./constants');

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

const logger = Logger();

const { FILENAME } = config;

const KNOWN_CONFIG_FILES = Object.freeze(Object.values(FILENAME));

const indexTokensMeta = async (tokenMeta, dbTrx) => {
	const tokenMetadataTable = await getTokenMetadataIndex();

	const tokenMetaToIndex = await BluebirdPromise.map(
		tokenMeta.tokens,
		async (token) => {
			const result = {
				chainID: tokenMeta.chainID.toLowerCase(),
				chainName: tokenMeta.chainName,
				network: tokenMeta.network,
				localID: token.tokenID.substring(constants.LENGTH_CHAIN_ID).toLowerCase(),
				tokenName: token.tokenName,
				tokenID: token.tokenID,
			};
			return result;
		},
		{ concurrency: tokenMeta.tokens.length },
	);

	await tokenMetadataTable.upsert(tokenMetaToIndex, dbTrx);
};

const indexAppMeta = async (appMeta, dbTrx) => {
	const applicationMetadataTable = await getApplicationMetadataIndex();

	const appMetaToIndex = {
		chainID: appMeta.chainID,
		chainName: appMeta.chainName,
		network: appMeta.networkType,
		isDefault: config.defaultApps.some(e => e === appMeta.chainName),
		appDirName: appMeta.appDirName,
	};

	await applicationMetadataTable.upsert(appMetaToIndex, dbTrx);
};

// Given filepath of app.json or nativetokens.json, indexes the information in DB
const indexMetadataFromFile = async (filePath, dbTrx) => {
	const [network, app, filename] = filePath.split('/').slice(-3);
	logger.debug(`Indexing metadata information for the app: ${app} (${network}) filename: ${filename}.`);

	if (!network || !app) throw Error('Require both \'network\' and \'app\'.');

	// While processing nativetokens.json in sync job, newly downloaded app.json will be present
	// in the temp download directory. Read from this file if present to fetch updated information.
	// Otherwise read the previously downloaded app.json path.
	const { dataDir } = config;
	const repo = config.gitHub.appRegistryRepoName;
	const oldAppJsonPath = `${dataDir}/${repo}/${network}/${app}/${FILENAME.APP_JSON}`;
	const downloadedAppJsonPath = `${path.dirname(filePath)}/${FILENAME.APP_JSON}`;
	const appJsonPath = await exists(downloadedAppJsonPath) ? downloadedAppJsonPath : oldAppJsonPath;

	logger.trace('Reading chain information.');
	const appMetaString = await read(appJsonPath);
	const appMeta = { ...JSON.parse(appMetaString), appDirName: app };

	if (filename === FILENAME.APP_JSON || filename === null) {
		logger.debug(`Indexing chain information for the app: ${app} (${network}).`);
		await indexAppMeta(appMeta, dbTrx);
		logger.debug(`Indexed chain information for the app: ${app} (${network}).`);
	}

	if (filename === FILENAME.NATIVETOKENS_JSON || filename === null) {
		logger.trace('Reading tokens information.');
		const tokenMetaString = await read(filePath);
		const tokenMeta = {
			...JSON.parse(tokenMetaString),
			chainName: appMeta.chainName,
			chainID: appMeta.chainID,
			network,
		};

		logger.debug(`Indexing tokens information for the app: ${app} (${network}).`);
		await indexTokensMeta(tokenMeta, dbTrx);
		logger.debug(`Indexed tokens information for the app: ${app} (${network}).`);
	}
	logger.info(`Finished indexing metadata information for the app: ${app} (${network}) file: ${filename}.`);
};

const deleteAppMeta = async (appMeta, dbTrx) => {
	const applicationMetadataTable = await getApplicationMetadataIndex();
	const appMetaParams = {
		network: appMeta.networkType,
		chainName: appMeta.chainName,
	};

	await applicationMetadataTable.delete(appMetaParams, dbTrx);
};

const deleteTokensMeta = async (tokenMeta, dbTrx) => {
	const tokenMetadataTable = await getTokenMetadataIndex();
	await BluebirdPromise.map(
		tokenMeta.localIDs,
		async (localID) => {
			const queryParams = {
				network: tokenMeta.network,
				chainName: tokenMeta.chainName,
				localID,
			};
			await tokenMetadataTable.delete(queryParams, dbTrx);
		},
		{ concurrency: tokenMeta.localIDs.length },
	);
};

const deleteIndexedMetadataFromFile = async (filePath, dbTrx) => {
	const [network, app, filename] = filePath.split('/').slice(-3);
	logger.debug(`Deleting metadata information for the app: ${app} (${network}) filename: ${filename}.`);

	if (!network || !app) throw Error('Require both \'network\' and \'app\'.');

	const appPathInClonedRepo = path.dirname(filePath);
	logger.trace('Reading chain information.');
	const appMetaString = await read(`${appPathInClonedRepo}/${FILENAME.APP_JSON}`);
	const appMeta = { ...JSON.parse(appMetaString) };

	if (filename === FILENAME.APP_JSON || filename === null) {
		logger.debug(`Deleting chain information for the app: ${app} (${network}).`);
		await deleteAppMeta(appMeta, dbTrx);
		logger.debug(`Deleted chain information for the app: ${app} (${network}).`);
	}

	if (filename === FILENAME.NATIVETOKENS_JSON || filename === null) {
		logger.trace('Reading tokens information.');
		const tokenMetaString = await read(filePath);
		const { tokens } = JSON.parse(tokenMetaString);
		const localIDs = tokens.map(
			token => token.tokenID.substring(constants.LENGTH_CHAIN_ID).toLowerCase(),
		);
		const tokenMeta = {
			localIDs,
			chainName: appMeta.chainName,
			network,
		};

		logger.debug(`Deleting tokens information for the app: ${app} (${network}).`);
		await deleteTokensMeta(tokenMeta, dbTrx);
		logger.debug(`Deleted tokens information for the app: ${app} (${network}).`);
	}
	logger.info(`Finished deleting metadata information for the app: ${app} (${network}) filename: ${filename}.`);
};

const indexAllBlockchainAppsMeta = async () => {
	const dataDirectory = config.dataDir;
	const repo = config.gitHub.appRegistryRepoName;
	const repoPath = path.join(dataDirectory, repo);
	const { supportedNetworks } = config;

	await BluebirdPromise.map(
		supportedNetworks,
		async network => {
			const appDirPath = path.join(repoPath, network);
			const allAvailableApps = await getDirectories(appDirPath);

			await BluebirdPromise.map(
				allAvailableApps,
				async app => {
					const allFilesFromApp = await getFiles(`${app}`);

					await BluebirdPromise.map(
						allFilesFromApp,
						async file => {
							const filename = file.split('/').pop();
							// Only process the known config files
							if (KNOWN_CONFIG_FILES.includes(filename)) {
								const connection = await getDbConnection(MYSQL_ENDPOINT);
								const dbTrx = await startDbTransaction(connection);

								try {
									logger.debug('Created new MySQL transaction to index blockchain metadata information.');
									await indexMetadataFromFile(file, dbTrx);
									await commitDbTransaction(dbTrx);
									logger.debug('Committed MySQL transaction to index blockchain metadata information.');
								} catch (error) {
									await rollbackDbTransaction(dbTrx);
									logger.debug(`Rolled back MySQL transaction to index blockchain metadata information.\nError: ${error}`);
								}
							}
						},
						{ concurrency: allFilesFromApp.length },
					);
				},
				{ concurrency: allAvailableApps.length },
			);
		},
		{ concurrency: supportedNetworks.length },
	);
};

module.exports = {
	indexAllBlockchainAppsMeta,
	indexMetadataFromFile,
	deleteIndexedMetadataFromFile,

	// For testing
	indexAppMeta,
	indexTokensMeta,
	deleteAppMeta,
	deleteTokensMeta,
};
