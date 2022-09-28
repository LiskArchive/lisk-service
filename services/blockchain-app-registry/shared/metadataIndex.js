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

const { getDirectories, read, getFiles } = require('./utils/fsUtils');

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
				tokenName: token.name,
			};
			return result;
		},
		{ concurrency: tokenMeta.tokens.length },
	);

	await tokenMetadataTable.upsert(tokenMetaToIndex, dbTrx);
};

const indexChainMeta = async (chainMeta, dbTrx) => {
	const applicationMetadataTable = await getApplicationMetadataIndex();

	const chainMetaToIndex = {
		chainID: chainMeta.chainID,
		chainName: chainMeta.chainName,
		network: chainMeta.networkType,
		isDefault: config.defaultApps.some(e => e === chainMeta.chainName),
		appDirName: chainMeta.appDirName,
	};

	await applicationMetadataTable.upsert(chainMetaToIndex, dbTrx);
};

const indexMetadataFromFile = async (network, app, filename = null, dbTrx) => {
	const { dataDir } = config;
	const repo = config.gitHub.appRegistryRepoName;
	logger.debug(`Indexing metadata information for the app: ${app} (${network})`);

	if (!network || !app) throw Error('Require both \'network\' and \'app\'.');

	const appPathInClonedRepo = `${dataDir}/${repo}/${network}/${app}`;
	logger.trace('Reading chain information');
	const chainMetaString = await read(`${appPathInClonedRepo}/${FILENAME.APP_JSON}`);
	const chainMeta = { ...JSON.parse(chainMetaString), appDirName: app };

	if (filename === FILENAME.APP_JSON || filename === null) {
		logger.debug(`Indexing chain information for the app: ${app} (${network})`);
		await indexChainMeta(chainMeta, dbTrx);
		logger.debug(`Indexed chain information for the app: ${app} (${network})`);
	}

	if (filename === FILENAME.NATIVETOKENS_JSON || filename === null) {
		logger.trace('Reading tokens information');
		const tokenMetaString = await read(`${appPathInClonedRepo}/${FILENAME.NATIVETOKENS_JSON}`);
		const tokenMeta = {
			...JSON.parse(tokenMetaString),
			chainName: chainMeta.chainName,
			chainID: chainMeta.chainID,
			network,
		};

		logger.debug(`Indexing tokens information for the app: ${app} (${network})`);
		await indexTokensMeta(tokenMeta, dbTrx);
		logger.debug(`Indexed tokens information for the app: ${app} (${network})`);
	}
	logger.info(`Finished indexing metadata information for the app: ${app} (${network})`);
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
							const [appName, filename] = file.split('/').slice(-2);
							// Only process the known config files
							if (KNOWN_CONFIG_FILES.includes(filename)) {
								const connection = await getDbConnection();
								const dbTrx = await startDbTransaction(connection);

								try {
									logger.debug('Created new MySQL transaction to index blockchain metadata information');
									await indexMetadataFromFile(network, appName, filename, dbTrx);
									await commitDbTransaction(dbTrx);
									logger.debug('Committed MySQL transaction to index blockchain metadata information');
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
};
