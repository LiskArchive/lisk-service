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
const { exists, mkdir, getDirectories, rename, rmdir } = require('./fsUtils');

const keyValueTable = require('../database/mysqlKVStore');
const { indexMetadataFromFile, deleteIndexedMetadataOfFile } = require('../metadataIndex');

const config = require('../../config');

const { KV_STORE_KEY } = require('../constants');

const { FILENAME } = config;

const logger = Logger();

const octokit = new Octokit({ auth: config.gitHub.accessToken });

const GITHUB_FILE_STATUS = Object.freeze({
	ADDED: 'added',
	REMOVED: 'removed',
	MODIFIED: 'modified',
	RENAMED: 'renamed',
	COPIED: 'copied',
	CHANGED: 'changed',
	UNCHANGED: 'unchanged',
});

const getRepoInfoFromURL = (url) => {
	const urlInput = url || '';
	const [, , , owner, repo] = urlInput.split('/');
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
		logger.error(`Unable to get latest commit hash due to: ${errorMsg}.`);
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
		logger.error(`Unable to access the repository due to: ${errorMsg}.`);
		throw error;
	}
};

const getFileDownloadURL = async (file) => {
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
		logger.error(`Unable to access the file due to: ${errorMsg}.`);
		throw error;
	}
};

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
	const filesChangedInput = filesChanged || [];
	const filesUpdated = filesChangedInput.filter(
		file => file.startsWith(network)
			&& (file.endsWith(FILENAME.APP_JSON) || file.endsWith(FILENAME.NATIVETOKENS_JSON)),
	);
	return filesUpdated;
};

const getUniqueNetworkAppDirPairs = async (files) => {
	const filesInput = files || [];
	const map = new Map();

	filesInput.forEach(file => {
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

const isMetadataFile = (filePath) => (
	filePath.endsWith(FILENAME.APP_JSON) || filePath.endsWith(FILENAME.NATIVETOKENS_JSON)
);

const syncWithRemoteRepo = async () => {
	try {
		const dataDirectory = config.dataDir;
		const appDirPath = path.join(dataDirectory, repo);

		const { lastSyncedCommitHash, latestCommitHash } = await getCommitInfo();

		if (lastSyncedCommitHash === latestCommitHash) {
			logger.info('Database is already up-to-date.');
		} else {
			const diffInfo = await getDiff(lastSyncedCommitHash, latestCommitHash);
			// TODO: Add a check to filter out non-blockchain apps related files
			// Sorting is necessary to ensure app.json is downloaded before nativetokens.json file
			// Otherwise the indexing may fail as token metadata indexing is dependant on app metadata
			const modifiedFiles = diffInfo.data.files.sort();

			const fileUpdatedStatuses = [
				GITHUB_FILE_STATUS.REMOVED,
				GITHUB_FILE_STATUS.MODIFIED,
				GITHUB_FILE_STATUS.CHANGED,
			];

			await BluebirdPromise.map(
				modifiedFiles,
				async modifiedFile => {
					const remoteFilePath = modifiedFile.filename;
					const localFilePath = path.join(appDirPath, remoteFilePath);

					// Delete indexed information if a meta file is updated/deleted
					if (isMetadataFile(remoteFilePath) && fileUpdatedStatuses.includes(modifiedFile.status)) {
						const [network, appName, filename] = remoteFilePath.split('/').slice(-3);
						await deleteIndexedMetadataOfFile(network, appName, filename);
					}

					// Skip download and indexing for deleted file
					if (modifiedFile.status === GITHUB_FILE_STATUS.REMOVED) {
						rmdir(localFilePath, { recursive: false });
						return;
					}

					// Download latest filePath
					const result = await getFileDownloadURL(remoteFilePath);
					await downloadFile(result.data.download_url, localFilePath);
					logger.debug(`Successfully downloaded: ${localFilePath}.`);

					// Update db with latest file information
					if (isMetadataFile(remoteFilePath)) {
						const [network, appName, filename] = remoteFilePath.split('/').slice(-3);
						await indexMetadataFromFile(network, appName, filename);
						logger.debug('Successfully updated the database with the latest changes.');
					}
				},
				{ concurrency: modifiedFiles.length },
			);

			await keyValueTable.set(KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC, latestCommitHash);

			if (modifiedFiles.length) {
				const modifiedFileNames = diffInfo.data.files.map(file => file.filename);
				const eventPayload = await buildEventPayload(modifiedFileNames);
				Signals.get('metadataUpdated').dispatch(eventPayload);
			}
		}
	} catch (error) {
		let errorMsg = error.message;
		if (Array.isArray(error)) errorMsg = error.map(e => e.message).join('\n');
		logger.error(`Unable to sync changes due to: ${errorMsg}.`);
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
