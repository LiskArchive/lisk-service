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
const http = require('http');
const https = require('https');
const tar = require('tar');
const path = require('path');
const { Octokit } = require('octokit');

const {
	Logger,
	Exceptions: { NotFoundException },
} = require('lisk-service-framework');

const { exists, mkdir, getDirectories, rename } = require('./fsUtils');
const config = require('../../config');

const logger = Logger();

const getHTTPProtocolByURL = (url) => url.startsWith('https') ? https : http;

const getRepoInfoFromURL = async (url) => {
	const [, , , owner, repo] = url.split('/');
	return { owner, repo };
};

const getPrivateRepoDownloadURL = async () => {
	try {
		const { owner, repo } = await getRepoInfoFromURL(config.gitHub.appRegistryRepo);
		const octokit = new Octokit({ auth: config.gitHub.accessToken });
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

const downloadRepositoryToFS = async () => {
	const dataDirectory = './data';
	const { repo } = await getRepoInfoFromURL(config.gitHub.appRegistryRepo);
	const appDirPath = path.join(dataDirectory, repo);

	if (await exists(appDirPath)) {
		// TODO: Pull latest changes
	} else {
		if (!(await exists(dataDirectory))) {
			await mkdir(dataDirectory, { recursive: true });
		}
		const { url } = await getPrivateRepoDownloadURL();
		await downloadAndExtractTarball(url, dataDirectory);

		const [oldDir] = await getDirectories(dataDirectory);
		await rename(oldDir, appDirPath);
	}
};

module.exports = {
	downloadRepositoryToFS,
	getRepoInfoFromURL,
};
