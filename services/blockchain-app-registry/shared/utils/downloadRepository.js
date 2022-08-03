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
const http = require('http');
const https = require('https');
const fs = require('fs');
const tar = require('tar');
const path = require('path');
const { Octokit } = require('octokit');

const {
	Logger,
	Exceptions: { NotFoundException },
} = require('lisk-service-framework');

const { exists, mkdir, getDirectories, rename } = require('./fsUtils');
const keyValueDB = require('../database/mysqlKVStore');
const config = require('../../config');

const logger = Logger();

const commitHashUntilLastSync = 'commitHashUntilLastSync';

const octokit = new Octokit({ auth: config.gitHub.accessToken });

const getHTTPProtocolByURL = (url) => url.startsWith('https') ? https : http;

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
	const base = await keyValueDB.get(commitHashUntilLastSync);
	const head = await getLatestCommitHash(owner, repo);
	return { base, head };
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

const getDiff = async () => {
	try {
		const { base, head } = await getCommitInfo(owner, repo);
		if (base === head) {
			logger.debug('Database is already synced');
			return;
		}
		const result = await octokit.request(
			`GET /repos/${owner}/${repo}/compare/${base}...${head}`,
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

const downloadAndExtractTarball = (url, directoryPath) => new Promise((resolve, reject) => {
	getHTTPProtocolByURL(url).get(url, (response) => {
		if (response.statusCode === 200) {
			response.pipe(tar.extract({ cwd: directoryPath }));
			response.on('error', async (err) => reject(new Error(err)));
			response.on('end', async () => {
				logger.info('File downloaded successfully');
				resolve();
			});
		} else {
			const errMessage = `Download failed with HTTP status code: ${response.statusCode}(${response.statusMessage})`;
			logger.error(errMessage);
			if (response.statusCode === 404) reject(new NotFoundException(errMessage));
			reject(new Error(errMessage));
		}
	});
});

const downloadFile = (url, dirPath) => new Promise((resolve, reject) => {
	getHTTPProtocolByURL(url).get(url, (response) => {
		if (response.statusCode === 200) {
			const writeStream = fs.createWriteStream(dirPath);
			response.pipe(writeStream);
			response.on('error', async (err) => reject(new Error(err)));
			response.on('end', async () => {
				logger.info('File downloaded successfully');
				resolve();
			});
		} else {
			const errMessage = `Download failed with HTTP status code: ${response.statusCode} (${response.statusMessage})`;
			logger.error(errMessage);
			if (response.statusCode === 404) reject(new NotFoundException(errMessage));
			reject(new Error(errMessage));
		}
	});
});

const getListOfFilesChanged = async () => {
	try {
		const result = await getDiff(owner, repo);
		const filesChanged = result.data.files.map(file => file.filename);
		return filesChanged;
	} catch (error) {
		let errorMsg = error.message;
		if (Array.isArray(error)) errorMsg = error.map(e => e.message).join('\n');
		logger.error(`Unable to get the list of files changed due to: ${errorMsg}`);
		throw error;
	}
};

const syncRepoWithLatestChanges = async () => {
	try {
		const dataDirectory = './data';
		const appDirPath = path.join(dataDirectory, repo);
		// TODO: Add a check to filter out non-blockchain apps related files
		const filesChanged = await getListOfFilesChanged();

		await BluebirdPromise.map(
			filesChanged,
			async file => {
				const result = await octokit.request(
					`GET /repos/${owner}/${repo}/contents/${file}`,
					{
						owner,
						repo,
						ref: `${config.gitHub.branch}`,
					},
				);
				await downloadFile(result.data.download_url, path.join(appDirPath, file));
				logger.debug(`Successfully updated: ${file}`);
			},
			{ concurrency: filesChanged.length },
		);
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
		await keyValueDB.set(commitHashUntilLastSync, lastCommitHash);
	}
};

module.exports = {
	downloadRepositoryToFS,
	getRepoInfoFromURL,
	syncRepoWithLatestChanges,
};
