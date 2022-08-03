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
} = require('lisk-service-framework');

const { downloadAndExtractTarball, downloadFile } = require('./downloadUtils');
const { exists, mkdir, getDirectories, rename } = require('./fsUtils');

const keyValueDB = require('../database/mysqlKVStore');
const { indexMetadataFromLocalFile } = require('../metadataIndex');

const config = require('../../config');

const logger = Logger();

const COMMIT_HASH_UNTIL_LAST_SYNC = 'commitHashUntilLastSync';

const octokit = new Octokit({ auth: config.gitHub.accessToken });

const getRepoInfoFromURL = (url) => {
	const [, , , owner, repo] = url.split('/');
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
	const lastCommitHash = await keyValueDB.get(COMMIT_HASH_UNTIL_LAST_SYNC);
	const latestCommitHash = await getLatestCommitHash();
	return { lastCommitHash, latestCommitHash };
};

const getPrivateRepoDownloadURL = async () => {
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

const getDiff = async (lastCommitHash, latestCommitHash) => {
	try {
		const result = await octokit.request(
			`GET /repos/${owner}/${repo}/compare/${lastCommitHash}...${latestCommitHash}`,
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
		logger.error(`Unable to get diff due to: ${errorMsg}`);
		throw error;
	}
};

const syncRepoWithLatestChanges = async () => {
	try {
		const dataDirectory = './data';
		const appDirPath = path.join(dataDirectory, repo);

		const { lastCommitHash, latestCommitHash } = await getCommitInfo();

		if (lastCommitHash !== latestCommitHash) {
			logger.info('Database is already up-to-date');
		} else {
			const diffInfo = await getDiff(lastCommitHash, latestCommitHash);
			// TODO: Add a check to filter out non-blockchain apps related files
			const filesChanged = diffInfo.data.files.map(file => file.filename);

			await BluebirdPromise.map(
				filesChanged,
				async file => {
					const result = await getFileDownloadURL(file);
					const filePath = path.join(appDirPath, file);
					await downloadFile(result.data.download_url, filePath);
					logger.debug(`Successfully downloaded: ${file}`);

					await indexMetadataFromLocalFile(filePath);
					logger.debug('Successfully updated the database with the latest changes');
				},
				{ concurrency: filesChanged.length },
			);
			await keyValueDB.set(COMMIT_HASH_UNTIL_LAST_SYNC, latestCommitHash);
		}
	} catch (error) {
		let errorMsg = error.message;
		if (Array.isArray(error)) errorMsg = error.map(e => e.message).join('\n');
		logger.error(`Unable to sync database due to: ${errorMsg}`);
		throw error;
	}
};

const downloadRepositoryToFS = async () => {
	const dataDirectory = './data';
	const appDirPath = path.join(dataDirectory, repo);

	if (await exists(appDirPath)) {
		await syncRepoWithLatestChanges();
	} else {
		if (!(await exists(dataDirectory))) {
			await mkdir(dataDirectory, { recursive: true });
		}
		const { url } = await getPrivateRepoDownloadURL();
		await downloadAndExtractTarball(url, dataDirectory);

		const [oldDir] = await getDirectories(dataDirectory);
		await rename(oldDir, appDirPath);

		const lastCommitHash = await getLatestCommitHash();
		await keyValueDB.set(COMMIT_HASH_UNTIL_LAST_SYNC, lastCommitHash);
	}
};

module.exports = {
	downloadRepositoryToFS,
	getRepoInfoFromURL,
	syncRepoWithLatestChanges,
};
