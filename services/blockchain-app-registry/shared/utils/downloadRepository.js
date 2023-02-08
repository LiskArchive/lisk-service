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
const { Octokit } = require('octokit');

const {
	Logger,
	Signals,
} = require('lisk-service-framework');

const { resolveChainNameByNetworkAppDir } = require('./chainUtils');
const { downloadAndExtractTarball, downloadFile } = require('./downloadUtils');
const { exists, mkdir, getDirectories, rename } = require('./fsUtils');

const keyValueTable = require('../database/mysqlKVStore');
const { indexMetadataFromFile } = require('../metadataIndex');

const config = require('../../config');

const { KV_STORE_KEY } = require('../constants');

const { FILENAME } = config;

const logger = Logger();

const octokit = new Octokit({ auth: config.gitHub.accessToken });

const getRepoInfoFromURL = (url) => {
	const [, , , owner, repo] = (url || '').split('/');
	return { owner, repo };
};

const { owner, repo } = getRepoInfoFromURL(config.gitHub.appRegistryRepo);

const getLatestCommitHash = async () => {
	try {
		const result = await octokit.request(
			`GET /repos/${owner}/${repo}/commits/${config.gitHub.branch}`,
			{
				owner,
				repo,
				ref: `${config.gitHub.branch}`,
			},
		);

		return result.data.sha;
	} catch (error) {
		let errorMsg = error.message;
		if (Array.isArray(error)) errorMsg = error.map(e => e.message).join('\n');
		logger.error(`Unable to get latest commit hash due to: ${errorMsg}`);
		throw error;
	}
};

const getCommitInfo = async () => {
	const lastSyncedCommitHash = await keyValueTable.get(KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC);
	const latestCommitHash = await getLatestCommitHash();
	return { lastSyncedCommitHash, latestCommitHash };
};

const getRepoDownloadURL = async () => {
	try {
		const result = await octokit.request(
			`GET /repos/${owner}/${repo}/tarball/${config.gitHub.branch}`,
			{
				owner,
				repo,
				ref: `${config.gitHub.branch}`,
			},
		);

		return result;
	} catch (error) {
		let errorMsg = error.message;
		if (Array.isArray(error)) errorMsg = error.map(e => e.message).join('\n');
		logger.error(`Unable to access the repository due to: ${errorMsg}`);
		throw error;
	}
};

const getFileDownloadURL = async (file) => {
	if (!file) return {};

	try {
		const result = await octokit.request(
			`GET /repos/${owner}/${repo}/contents/${file}`,
			{
				owner,
				repo,
				ref: `${config.gitHub.branch}`,
			},
		);

		return result;
	} catch (error) {
		let errorMsg = error.message;
		if (Array.isArray(error)) errorMsg = error.map(e => e.message).join('\n');
		logger.error(`Unable to access the file due to: ${errorMsg}`);
		throw error;
	}
};

// TODO: Update implementation to handle undefined lastSyncedCommitHash
const getDiff = async (lastSyncedCommitHash, latestCommitHash) => {
	const url = `GET /repos/${owner}/${repo}/compare/${lastSyncedCommitHash}...${latestCommitHash}`;
	try {
		const result = await octokit.request(
			url,
			{
				owner,
				repo,
				ref: `${config.gitHub.branch}`,
			},
		);

		return result;
	} catch (error) {
		let errorMsg = error.message;
		if (Array.isArray(error)) errorMsg = error.map(e => e.message).join('\n');
		logger.warn(`URL invocation failed: ${url}.`);
		logger.error(`Unable to get diff due to: ${errorMsg}.`);
		throw error;
	}
};

const filterMetaConfigFilesByNetwork = async (network, filesChanged) => {
	const filesUpdated = (filesChanged || []).filter(
		file => file.startsWith(network)
			&& (file.endsWith(FILENAME.APP_JSON) || file.endsWith(FILENAME.NATIVETOKENS_JSON)),
	);
	return filesUpdated;
};

const getUniqueNetworkAppDirPairs = async (files) => {
	const map = new Map();

	(files || []).forEach(file => {
		const [network, appDirName] = file.split('/');
		const updatedAppDir = `${network}/${appDirName}`;
		map.set(updatedAppDir, { network, appDirName });
	});

	return [...map.values()];
};

const buildEventPayload = async (allFilesModified) => {
	const eventPayload = {};

	const { supportedNetworks } = config;
	const numSupportedNetworks = supportedNetworks.length;
	for (let index = 0; index < numSupportedNetworks; index++) {
		/* eslint-disable no-await-in-loop */
		const networkType = supportedNetworks[index];
		const filesUpdated = await filterMetaConfigFilesByNetwork(networkType, allFilesModified);

		const appsUpdated = await BluebirdPromise.map(
			await getUniqueNetworkAppDirPairs(filesUpdated),
			async ({ network, appDirName }) => resolveChainNameByNetworkAppDir(network, appDirName),
			{ concurrency: filesUpdated.length },
		);

		eventPayload[networkType] = appsUpdated;
		/* eslint-enable no-await-in-loop */
	}

	return eventPayload;
};

const syncWithRemoteRepo = async () => {
	try {
		const dataDirectory = config.dataDir;
		const appDirPath = path.join(dataDirectory, repo);

		const { lastSyncedCommitHash, latestCommitHash } = await getCommitInfo();

		if (lastSyncedCommitHash === latestCommitHash) {
			logger.info('Database is already up-to-date');
		} else {
			const diffInfo = await getDiff(lastSyncedCommitHash, latestCommitHash);
			// TODO: Add a check to filter out non-blockchain apps related files
			const filesChanged = diffInfo.data.files.map(file => file.filename);

			await BluebirdPromise.map(
				filesChanged,
				async file => {
					const result = await getFileDownloadURL(file);
					const filePath = path.join(appDirPath, file);
					await downloadFile(result.data.download_url, filePath);
					logger.debug(`Successfully downloaded: ${file}`);

					if (file.endsWith(FILENAME.APP_JSON) || file.endsWith(FILENAME.NATIVETOKENS_JSON)) {
						const [network, appName, filename] = file.split('/').slice(-3);
						await indexMetadataFromFile(network, appName, filename);
						logger.debug('Successfully updated the database with the latest changes');
					}
				},
				{ concurrency: filesChanged.length },
			);

			await keyValueTable.set(KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC, latestCommitHash);

			if (filesChanged.length) {
				const eventPayload = await buildEventPayload(filesChanged);
				Signals.get('metadataUpdated').dispatch(eventPayload);
			}
		}
	} catch (error) {
		let errorMsg = error.message;
		if (Array.isArray(error)) errorMsg = error.map(e => e.message).join('\n');
		logger.error(`Unable to sync changes due to: ${errorMsg}`);
		throw error;
	}
};

const downloadRepositoryToFS = async () => {
	const dataDirectory = config.dataDir;
	const appDirPath = path.join(dataDirectory, repo);

	if (await exists(appDirPath)) {
		logger.trace('Synchronizing with the remote repository.');
		await syncWithRemoteRepo();
		logger.debug('Finished synchronizing with the remote repository successfully.');
	} else {
		if (!(await exists(dataDirectory))) {
			logger.trace('Creating data directory.');
			await mkdir(dataDirectory, { recursive: true });
			logger.debug('Created data directory successfully.');
		}

		const { url } = await getRepoDownloadURL();
		await downloadAndExtractTarball(url, dataDirectory);

		const [oldDir] = await getDirectories(dataDirectory);
		await rename(oldDir, appDirPath);

		const latestCommitHash = await getLatestCommitHash();
		await keyValueTable.set(KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC, latestCommitHash);
	}
};

module.exports = {
	downloadRepositoryToFS,
	getRepoInfoFromURL,
	syncWithRemoteRepo,

	// For testing
	getRepoDownloadURL,
	getLatestCommitHash,
	getCommitInfo,
	getUniqueNetworkAppDirPairs,
	filterMetaConfigFilesByNetwork,
	getFileDownloadURL,
	getDiff,
	buildEventPayload,
};
