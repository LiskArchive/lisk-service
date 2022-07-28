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
const path = require('path');
const simpleGit = require('simple-git');
const config = require('../../config');

const { exists, mkdir } = require('./fsUtils');

const cloneRepo = async (url, directory) => {
	const git = simpleGit({
	    config: [`Authorization: token ${config.gitHub.accessTokenGitHub}`],
	});

	// const git = simpleGit();

	return git.clone(url, directory).catch((err) => {
		console.error(err);
	});
};

const downloadRepo = async () => {
	const localRepoPath = './data/repo';
	const directoryPath = path.dirname(localRepoPath);

	if (!(await exists(directoryPath))) await mkdir(directoryPath, { recursive: true });
	await cloneRepo(config.gitHub.url, directoryPath);
};

module.exports = {
	downloadRepo,
};
