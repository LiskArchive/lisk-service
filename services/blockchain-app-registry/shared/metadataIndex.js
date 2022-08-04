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

const applicationsIndexSchema = require('./database/schema/applications');
const tokensIndexSchema = require('./database/schema/tokens');

const { getChainIDByName } = require('./utils/chainUtils');
const { getDirectories, read, getFiles } = require('./utils/fsUtils');

const config = require('../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

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

const logger = Logger();

const indexTokensInfo = async (filePath, dbTrx) => {
	const tokensDB = await getTokensIndex();

	const response = await read(filePath);
	const tokenInfo = JSON.parse(response);

	const tokenInfoToIndex = await BluebirdPromise.map(
		tokenInfo.assets,
		async (asset) => {
			const result = {
				chainID: tokenInfo.chain_id,
				chainName: tokenInfo.chain_name,
				description: asset.description,
				name: asset.name,
				Symbol: asset.symbol,
				display: asset.display,
				base: asset.base,
				exponent: asset.exponent,
				logo: JSON.stringify(asset.token_logo_URIs),
			};
			return result;
		},
		{ concurrency: tokenInfo.assets.length },
	);

	await tokensDB.upsert(tokenInfoToIndex, dbTrx);
};

const indexChainInfo = async (filePath, dbTrx) => {
	const applicationsDB = await getApplicationsIndex();

	const response = await read(filePath);
	const chainInfo = JSON.parse(response);

	const chainID = chainInfo.chain_id
		? chainInfo.chain_id
		: await getChainIDByName(chainInfo.chain_name, chainInfo.network);

	const chainInfoToIndex = {
		chainID,
		name: chainInfo.chain_name,
		description: chainInfo.description,
		title: chainInfo.title,
		network: chainInfo.network,
		genesisBlock: chainInfo.genesis_url,
		homepage: chainInfo.homepage,
		apis: JSON.stringify(chainInfo.apis),
		images: JSON.stringify(chainInfo.images),
		explorers: JSON.stringify(chainInfo.explorers),
	};

	await applicationsDB.upsert(chainInfoToIndex, dbTrx);
};

const indexMetadataFromFile = async (file, dbTrx) => {
	logger.info(`Indexing metadata information for the app: ${file.split('/')[2]}`);

	if (file.includes('token.json')) {
		logger.info(`Indexing tokens information for the app: ${file.split('/')[2]}`);
		await indexTokensInfo(file, dbTrx);
	} else if (file.includes('chain.json')) {
		logger.info(`Indexing chain information for the app: ${file.split('/')[2]}`);
		await indexChainInfo(file, dbTrx);
	}
};

const indexBlockchainMetadata = async () => {
	const dataDirectory = './data';
	const [, , , , repo] = config.gitHub.appRegistryRepo.split('/');
	const appDirPath = path.join(dataDirectory, repo);
	const allAvailableApps = await getDirectories(appDirPath);

	await BluebirdPromise.map(
		allAvailableApps,
		async app => {
			// TODO: Add a check to filter out files and non-blockchain apps
			const allFilesFromApp = await getFiles(`${app}`);
			await BluebirdPromise.map(
				allFilesFromApp,
				async file => {
					const connection = await getDbConnection();
					const dbTrx = await startDbTransaction(connection);

					try {
						logger.debug('Created new MySQL transaction to index blockchain metadata information');
						await indexMetadataFromFile(file, dbTrx);
						await commitDbTransaction(dbTrx);
						logger.debug('Committed MySQL transaction to index blockchain metadata information');
					} catch (error) {
						await rollbackDbTransaction(dbTrx);
						logger.debug('Rolled back MySQL transaction to index blockchain metadata information');
					}
				},
				{ concurrency: allFilesFromApp.length },
			);
		},
		{ concurrency: allAvailableApps.length },
	);
};

module.exports = {
	indexBlockchainMetadata,
	indexMetadataFromFile,
};
