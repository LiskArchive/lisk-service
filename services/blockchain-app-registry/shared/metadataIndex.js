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
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const { initDatabase } = require('./database/index');

const applicationsIndexSchema = require('./database/schema/applications');
const tokensIndexSchema = require('./database/schema/tokens');

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

const { downloadRepositoryToFS } = require('./utils/downloadRepository');

const { getDirectories, read, getFiles } = require('./utils/fsUtils');

const logger = Logger();

const indexTokensInfo = async (filePath) => {
	const tokensDB = await getTokensIndex();

	const response = await read(filePath);
	const tokenInfo = JSON.parse(response);

	const tokenInfoToIndex = await BluebirdPromise.map(
		tokenInfo.assets,
		async (asset) => {
			const result = {
				// chainID: '', // TODO: Discuss
				chainName: tokenInfo.chain_name,
				description: asset.description,
				name: asset.name,
				Symbol: asset.symbol,
				display: asset.display,
				base: asset.base,
				exponent: 8,
				// logo: JSON.stringify(asset.token_logo_URIs),
				logo: JSON.stringify(asset.logo_URIs),
			};
			return result;
		}, { concurrency: tokenInfo.assets.length },
	);

	await tokensDB.upsert(tokenInfoToIndex);
};

const indexChainInfo = async (filePath) => {
	const applicationsDB = await getApplicationsIndex();

	const response = await read(filePath);
	const chainInfo = JSON.parse(response);

	const chainInfoToIndex = {
		chainID: chainInfo.chain_id, // TODO: Discuss
		name: chainInfo.chain_name,
		// description: '',
		// title: asset.description,
		// network: asset.description,
		// genesisBlock: asset.description,
		homepage: chainInfo.homepage,
		apis: JSON.stringify(chainInfo.apis),
		images: JSON.stringify(chainInfo.logos),
		explorers: JSON.stringify(chainInfo.explorers),
	};

	await applicationsDB.upsert(chainInfoToIndex);
};

const indexBlockchainMetadata = async () => {
	const localRepoPath = config.gitHub.extractPath;
	const allAvailableDir = await getDirectories(localRepoPath);

	await BluebirdPromise.map(
		allAvailableDir,
		async dir => {
			const allFilesPath = await getFiles(`${dir}`);
			await BluebirdPromise.map(
				allFilesPath,
				async filePath => {
					if (filePath.includes('/assetlist.json')) {
						logger.info(`Indexing tokens information for the app: ${filePath.split('/')[2]}`);
						await indexTokensInfo(filePath);
					} else if (filePath.includes('/chain.json')) {
						logger.info(`Indexing chain information for the app: ${filePath.split('/')[1]}`);
						await indexChainInfo(filePath);
					}
				},
				{ concurrency: allFilesPath.length },
			);
		},
		{ concurrency: allAvailableDir.length },
	);
};

const init = async () => {
	await initDatabase();
	await downloadRepositoryToFS();
	await indexBlockchainMetadata();
};

module.exports = {
	init,
};
