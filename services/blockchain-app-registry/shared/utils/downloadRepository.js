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
	MySQL: {
		getDbConnection,
		startDbTransaction,
		commitDbTransaction,
	},
	Signals,
} = require('lisk-service-framework');

const { resolveChainNameByNetworkAppDir } = require('./chainUtils');
const { downloadAndExtractTarball, downloadFile } = require('./downloadUtils');
const { exists, mkdir, getDirectories, rename, rmdir, rm } = require('./fsUtils');

const keyValueTable = require('../database/mysqlKVStore');
const { indexMetadataFromFile, deleteIndexedMetadataFromFile } = require('../metadataIndex');

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

const MYSQL_ENDPOINT = config.endpoints.mysql;

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

/* Sorts the passed array and groups files by the network and app. Returns following structure:
{
	network: {
		app: [
			file,
		]
	}
}
*/
const groupFilesByNetworkAndApp = (fileInfos) => {
	// Stores an map of networkName
	const groupedFiles = {};

	// Sorting is necessary to ensure app.json is processed before nativetokens.json file
	// Otherwise the indexing may fail as token metadata indexing is dependant on app metadata
	fileInfos.sort((first, second) => first.filename.localeCompare(second.filename));

	fileInfos.forEach(fileInfo => {
		const [network, appName, fileName] = fileInfo.filename.split('/').slice(-3);

		// Only process metadata files
		if (!isMetadataFile(fileName)) return;

		if (!(network in groupedFiles)) groupedFiles[network] = {};
		if (!(appName in groupedFiles[network])) groupedFiles[network][appName] = [];

		groupedFiles[network][appName].push(fileInfo);
	});

	return groupedFiles;
};

const getModifiedFileNames = (groupedFiles) => {
	const fileNames = [];

	Object.keys(groupedFiles).forEach(network => {
		const appsInNetwork = groupedFiles[network];

		Object.keys(appsInNetwork).forEach(appName => {
			const appFiles = appsInNetwork[appName];

			appFiles.forEach(file => fileNames.push(file.filename));
		});
	});

	return fileNames;
};

const syncWithRemoteRepo = async () => {
	try {
		const dataDirectory = config.dataDir;
		const appDirPath = path.join(dataDirectory, repo);

		const { lastSyncedCommitHash, latestCommitHash } = await getCommitInfo();

		// Skip if there is no new commit
		if (lastSyncedCommitHash === latestCommitHash) {
			logger.info('Database is already up-to-date.');
			return;
		}

		const fileUpdatedStatuses = [
			GITHUB_FILE_STATUS.REMOVED,
			GITHUB_FILE_STATUS.MODIFIED,
			GITHUB_FILE_STATUS.CHANGED,
		];

		const diffInfo = await getDiff(lastSyncedCommitHash, latestCommitHash);
		const groupedFiles = groupFilesByNetworkAndApp(diffInfo.data.files);
		const connection = await getDbConnection(MYSQL_ENDPOINT);

		await BluebirdPromise.map(
			Object.keys(groupedFiles),
			async (networkName) => {
				const appsInNetwork = groupedFiles[networkName];

				await BluebirdPromise.map(
					Object.keys(appsInNetwork),
					async (appName) => {
						const appFiles = appsInNetwork[appName];
						const dbTrx = await startDbTransaction(connection);
						const filesToBeDeleted = [];

						// Process files in an app. This must be processed sequentially.
						// Because indexing of nativetokens.json dependant on app.json
						// eslint-disable-next-line no-restricted-syntax
						for (const modifiedFile of appFiles) {
							/* eslint-disable no-await-in-loop */
							const remoteFilePath = modifiedFile.filename;
							const localFilePath = path.join(appDirPath, remoteFilePath);
							const [fileName] = remoteFilePath.split('/').slice(-1);

							// Delete indexed information if a meta file is updated/deleted
							if (fileUpdatedStatuses.includes(modifiedFile.status)) {
								await deleteIndexedMetadataFromFile(networkName, appName, fileName, dbTrx);
							}

							// Skip download and indexing for deleted file.
							// The file should be deleted only after processing of the app is done.
							// As app.json file is required to delete indexed info of nativetokens.json
							if (modifiedFile.status === GITHUB_FILE_STATUS.REMOVED) {
								filesToBeDeleted.push(localFilePath);
								// eslint-disable-next-line no-continue
								continue;
							}

							// Create directory and download latest file
							const dirPath = path.dirname(localFilePath);
							await mkdir(dirPath, { recursive: true });

							const result = await getFileDownloadURL(remoteFilePath);
							await downloadFile(result.data.download_url, localFilePath);
							logger.debug(`Successfully downloaded: ${localFilePath}.`);

							// Update db with latest metadata file information
							await indexMetadataFromFile(networkName, appName, fileName, dbTrx);
							logger.debug('Successfully updated the database with the latest changes.');

							/* eslint-enable no-await-in-loop */
						}

						// Delete files which are removed from remote
						await BluebirdPromise.map(
							filesToBeDeleted,
							async (filePath) => rm(filePath),
							{ concurrency: filesToBeDeleted.length },
						);
						await commitDbTransaction(dbTrx);
					},
					{ concurrency: Object.keys(appsInNetwork).length },
				);
			},
			{ concurrency: Object.keys(groupedFiles).length },
		);

		await keyValueTable.set(KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC, latestCommitHash);

		if (Object.keys(groupedFiles).length) {
			const modifiedFileNames = getModifiedFileNames(groupedFiles);
			const eventPayload = await buildEventPayload(modifiedFileNames);
			Signals.get('metadataUpdated').dispatch(eventPayload);
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
	const lastSyncedCommitHash = await keyValueTable.get(KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC);

	if (lastSyncedCommitHash && await exists(appDirPath)) {
		logger.trace('Synchronizing with the remote repository.');
		await syncWithRemoteRepo();
		logger.info('Finished synchronizing with the remote repository successfully.');
	} else {
		if (!(await exists(dataDirectory))) {
			logger.trace(`Creating data directory: ${dataDirectory}.`);
			await mkdir(dataDirectory, { recursive: true });
			logger.info(`Created data directory successfully: ${dataDirectory}.`);
		} else if (await exists(appDirPath)) {
			// When lastSyncedCommitHash doesn't exist, clear the local copy and clone the repo again
			await rmdir(appDirPath);
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
